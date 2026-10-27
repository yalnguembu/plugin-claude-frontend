// Pure guard rules: each returns { decision: "deny" | "ask", reason } or null.
import { basename, isAbsolute, relative, resolve } from "node:path";

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const mentionsBranch = (text, name) =>
  new RegExp(`(^|[\\s/:'"])${escape(name)}($|[\\s'":])`).test(text);

const normalizePath = (p) =>
  p.replace(/^["']|["']$/g, "").replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "");

export function isUnder(path, roots) {
  const p = normalizePath(path).toLowerCase();
  return roots.some((root) => {
    const r = normalizePath(root).toLowerCase();
    return p === r || p.startsWith(`${r}/`) || p.endsWith(`/${r}`) || p.includes(`/${r}/`);
  });
}

const ENV_FILE = /^\.env(\..+)?$/i;
const isForbiddenEnv = (name, config) =>
  ENV_FILE.test(name) && !config.allowedEnvFiles.some((a) => a.toLowerCase() === name.toLowerCase());

function envFilesIn(text) {
  const found = [];
  const re = /(?:^|[\s"'/\\=(])(\.env(?:\.[\w.-]+)?)(?=$|[\s"'|;&)>,])/g;
  let m;
  while ((m = re.exec(text))) found.push(m[1]);
  return found;
}

// Splits on shell separators; quoted separators inside messages are rare enough to accept.
const segmentsOf = (command) =>
  command.split(/&&|\|\||[;|\n]/).map((s) => s.trim()).filter(Boolean);

function parseGit(segment) {
  const m = segment.match(/\bgit((?:\s+-C\s+(?:"[^"]*"|'[^']*'|\S+)|\s+-c\s+\S+)*)\s+([a-z][a-z-]*)/);
  if (!m) return null;
  const dir = m[1].match(/-C\s+("[^"]*"|'[^']*'|\S+)/)?.[1];
  return { verb: m[2], dir: dir && normalizePath(dir), rest: segment.slice(m.index + m[0].length) };
}

const NEVER_ON_PROTECTED = ["checkout", "switch", "push", "reset", "rebase", "merge", "cherry-pick", "branch", "worktree"];
const WRITES_ON_CURRENT = ["commit", "push", "reset", "rebase", "merge", "pull", "cherry-pick", "revert", "am"];
const WRITES_ON_BASE = ["commit", "push", "reset", "rebase", "cherry-pick", "revert", "am"];
const REPO_WRITES = ["commit", "push", "add", "tag", "reset", "rebase", "merge", "checkout", "switch", "stash", "rm", "mv", "restore"];
const ENV_SAFE = /\bgit\s+(rm\s+(-r\s+)?--cached|ls-files|check-ignore|status|update-index)\b/;

const deny = (reason) => ({ decision: "deny", reason });

export function checkCommand(command, { config, branch }) {
  if (!command) return null;
  const ro = config.readOnlyPaths;
  let cdTarget = null;
  let needsApproval = null;
  let writesMessage = false;

  for (const segment of segmentsOf(command)) {
    const cd = segment.match(/^(?:cd|pushd|Set-Location|sl)\s+(?:-Path\s+)?(.+)$/i);
    if (cd) cdTarget = normalizePath(cd[1].trim());

    if (!ENV_SAFE.test(segment)) {
      const env = envFilesIn(segment).find((f) => isForbiddenEnv(basename(f), config));
      if (env) return deny(`${env} : les fichiers .env ne se lisent pas et ne se citent pas (seuls ${config.allowedEnvFiles.join(", ")} le peuvent).`);
    }

    if (ro.length && new RegExp(`>>?\\s*["']?(\\./)?(${ro.map((r) => escape(normalizePath(r))).join("|")})(/|\\b)`).test(segment))
      return deny(`${ro.join(", ")} est en lecture seule : rien ne s'y écrit.`);

    if (/\bgh\s+pr\s+merge\b/.test(segment))
      return deny(`Les pull requests se fusionnent à la relecture (${config.reviewer}), jamais par Claude.`);
    if (/\bgh\s+pr\s+(create|edit)\b/.test(segment)) {
      writesMessage = true;
      needsApproval ??= "ouvrir ou modifier une pull request";
    }

    const g = parseGit(segment);
    if (!g) continue;
    const { verb, dir, rest } = g;

    if (verb === "merge" && !/--abort\b/.test(rest))
      return deny(`Aucune fusion locale : le travail entre dans ${config.baseBranch} par une pull request.`);
    if (verb === "pull" && !/--ff-only\b/.test(rest))
      return deny("git pull se fait en --ff-only : jamais de fusion implicite.");

    for (const p of config.protectedBranches) {
      if (NEVER_ON_PROTECTED.includes(verb) && mentionsBranch(rest, p))
        return deny(`On ne fait jamais rien sur ${p} : ni branche, ni commit, ni fusion, ni remise à zéro, ni envoi.`);
      if (branch === p && WRITES_ON_CURRENT.includes(verb))
        return deny(`Le dépôt est sur ${p} : passer sur ${config.baseBranch} ou sur la branche de la tâche.`);
    }

    if (branch === config.baseBranch && WRITES_ON_BASE.includes(verb))
      return deny(`Rien ne se commite ni ne s'envoie directement sur ${config.baseBranch} : ouvrir la branche de la tâche.`);
    if (verb === "push" && mentionsBranch(rest, config.baseBranch))
      return deny(`On n'envoie pas sur ${config.baseBranch} : la pull request s'en charge.`);

    const where = dir || cdTarget;
    if (where && isUnder(where, ro) && REPO_WRITES.includes(verb))
      return deny(`${where} est en lecture seule : ni commit, ni statut, ni historique.`);

    if (verb === "commit") {
      writesMessage = true;
      needsApproval ??= "commiter";
    }
    if (verb === "push") needsApproval ??= "envoyer la branche";
    if (verb === "tag" && rest.trim() && !/^\s*(-l|--list)\b/.test(rest)) needsApproval ??= "créer une étiquette";
  }

  if (writesMessage) {
    const word = config.forbiddenInCommits.find((w) => new RegExp(`\\b${escape(w)}\\b`, "i").test(command));
    if (word) return deny(`« ${word} » ne figure jamais dans un commit ni dans une pull request.`);
  }

  if (needsApproval && config.requireApproval)
    return { decision: "ask", reason: `Accord explicite requis (${config.reviewer}) pour ${needsApproval}.` };

  return null;
}

const WRITE_TOOLS = ["Edit", "Write", "MultiEdit", "NotebookEdit"];

export function checkFile(toolName, input, { config, dir }) {
  const target = input?.file_path || input?.path || input?.notebook_path;

  if (toolName === "Grep" && input?.glob && /\.env/i.test(input.glob) && !/example/i.test(input.glob))
    return deny("Les fichiers .env ne se lisent pas, même par recherche.");
  if (!target) return null;

  const name = basename(target.replace(/\\/g, "/"));
  if (isForbiddenEnv(name, config))
    return deny(`${name} : les fichiers .env ne se lisent pas et ne se modifient pas.`);

  if (WRITE_TOOLS.includes(toolName)) {
    const abs = isAbsolute(target) ? target : resolve(dir, target);
    const rel = relative(dir, abs);
    if (!rel.startsWith("..") && isUnder(rel, config.readOnlyPaths))
      return deny(`${rel} est en lecture seule : rien ne s'y écrit.`);
  }
  return null;
}
