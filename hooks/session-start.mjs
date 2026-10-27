// SessionStart: git state to compare with the state file, and a warning on a protected branch.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { CONFIG_FILE, git, loadConfig, projectDir, readInput } from "./lib/config.mjs";

const input = await readInput();
const dir = projectDir(input);
const { config, found, error } = loadConfig(dir);
const out = [];

if (!found) out.push(`claude-pluggin-frontend : pas de ${CONFIG_FILE}, valeurs par défaut.`);
if (error) out.push(`claude-pluggin-frontend : ${CONFIG_FILE} illisible (${error}), valeurs par défaut.`);

const status = git(dir, ["status", "-sb"]);
if (status) {
  out.push(`État git au démarrage (à comparer à ${config.stateFile}) :`);
  out.push(...status.split("\n").slice(0, 15));

  if (config.contractSubmodule && existsSync(join(dir, config.contractSubmodule))) {
    out.push(`--- ${config.contractSubmodule} (sous-module, lecture seule)`);
    out.push(git(dir, ["submodule", "status", config.contractSubmodule]));
  }

  const branch = git(dir, ["branch", "--show-current"]);
  if (config.protectedBranches.includes(branch))
    out.push(`ATTENTION : le dépôt est sur ${branch}. On n'y fait jamais rien : passer sur ${config.baseBranch} ou sur la branche de la tâche.`);
  else if (branch === config.baseBranch)
    out.push(`Sur ${branch} : ouvrir la branche de la tâche (/claude-pluggin-frontend:tache-debut) avant toute modification.`);
}

if (existsSync(join(dir, config.stateFile)))
  out.push(`Reprendre depuis la « Prochaine action » de ${config.stateFile}.`);

process.stdout.write(out.join("\n") + "\n");
