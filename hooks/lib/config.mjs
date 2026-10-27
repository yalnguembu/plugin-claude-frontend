import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

export const CONFIG_FILE = ".claude/plugin-claude-frontend.json";

export const DEFAULTS = {
  baseBranch: "develop",
  protectedBranches: ["main"],
  reviewer: "le responsable du dépôt",
  requireApproval: true,
  readOnlyPaths: ["contracts/"],
  contractSubmodule: "contracts",
  contractVersionFile: "CONTRACT_VERSION",
  stateFile: ".claude/etat/en-cours.md",
  frontendDir: "frontend",
  packageManager: "pnpm",
  taskSheetsDir: "design/11-taches",
  featureRecipe: "docs/AJOUTER-UNE-FEATURE.md",
  visualChecklist: "design/10-kit-claude-design/controle-visuel.md",
  checks: ["typecheck", "lint", "test"],
  e2eScript: "test:e2e",
  e2eFinalScript: "test:e2e:fin",
  forbiddenInCommits: ["Co-Authored-By", "Claude", "Anthropic"],
  allowedEnvFiles: [".env.example"],
};

export function projectDir(input) {
  return process.env.CLAUDE_PROJECT_DIR || input?.cwd || process.cwd();
}

// Returns the merged config and, when the file exists but is invalid, the parse error.
export function loadConfig(dir) {
  let raw;
  try {
    raw = readFileSync(join(dir, CONFIG_FILE), "utf8");
  } catch {
    return { config: { ...DEFAULTS }, found: false, error: null };
  }
  try {
    return { config: { ...DEFAULTS, ...JSON.parse(raw) }, found: true, error: null };
  } catch (error) {
    return { config: { ...DEFAULTS }, found: true, error: error.message };
  }
}

export function git(dir, args) {
  try {
    return execFileSync("git", ["-C", dir, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

export async function readInput() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  try {
    return JSON.parse(data || "{}");
  } catch {
    return {};
  }
}

export function emitDecision(result) {
  if (!result) return;
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: result.decision,
        permissionDecisionReason: result.reason,
      },
    }),
  );
}
