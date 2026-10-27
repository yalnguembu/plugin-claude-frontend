import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../hooks/lib/config.mjs";
import { checkCommand, checkFile } from "../hooks/lib/rules.mjs";

const config = { ...DEFAULTS, reviewer: "Yal" };
const cmd = (command, branch = "feat/e-res-17") => checkCommand(command, { config, branch })?.decision ?? "allow";
const file = (tool, input) => checkFile(tool, input, { config, dir: "/repo" })?.decision ?? "allow";

test("main is never touched", () => {
  assert.equal(cmd("git switch main"), "deny");
  assert.equal(cmd("git checkout -b feat/x main"), "deny");
  assert.equal(cmd("git push origin main"), "deny");
  assert.equal(cmd("git reset --hard origin/main"), "deny");
  assert.equal(cmd("git rebase main"), "deny");
  assert.equal(cmd("git status", "main"), "allow");
  assert.equal(cmd("git commit -m x", "main"), "deny");
  assert.equal(cmd("git log main..HEAD"), "allow");
  assert.equal(cmd("git switch maintenance"), "allow");
});

test("the base branch only moves through pull requests", () => {
  assert.equal(cmd("git switch develop && git pull --ff-only"), "allow");
  assert.equal(cmd("git switch -c feat/e-adm-12-operateurs", "develop"), "allow");
  assert.equal(cmd("git commit -m x", "develop"), "deny");
  assert.equal(cmd("git push origin develop"), "deny");
});

test("no local merge, no implicit merge", () => {
  assert.equal(cmd("git merge feat/x"), "deny");
  assert.equal(cmd("git merge --abort"), "allow");
  assert.equal(cmd("git pull"), "deny");
  assert.equal(cmd("gh pr merge 14"), "deny");
});

test("commits, pushes and pull requests wait for approval", () => {
  assert.equal(cmd('git commit -m "feat(top-ups): list"'), "ask");
  assert.equal(cmd("git push -u origin feat/e-res-17"), "ask");
  assert.equal(cmd('gh pr create --base develop --title "feat: x"'), "ask");
  assert.equal(cmd("git tag v0.2.0"), "ask");
  assert.equal(cmd("git tag --list"), "allow");
  assert.equal(checkCommand("git commit -m x", { config: { ...config, requireApproval: false }, branch: "feat/x" }), null);
});

test("no attribution in commit messages or pull requests", () => {
  assert.equal(cmd('git commit -m "x" -m "Co-Authored-By: Someone"'), "deny");
  assert.equal(cmd('gh pr create --body "Generated with Claude Code"'), "deny");
  assert.equal(cmd("git log --grep Claude"), "allow");
});

test("the contract is read only", () => {
  assert.equal(cmd("git submodule update --init --remote contracts"), "allow");
  assert.equal(cmd("git -C contracts log --oneline"), "allow");
  assert.equal(cmd('git -C contracts commit -m "status"'), "deny");
  assert.equal(cmd("cd contracts && git add . && git commit -m x"), "deny");
  assert.equal(cmd("echo done > contracts/features/010/status.md"), "deny");
  assert.equal(file("Edit", { file_path: "contracts/README.md" }), "deny");
  assert.equal(file("Write", { file_path: "/repo/contracts/x.md" }), "deny");
  assert.equal(file("Read", { file_path: "/repo/contracts/README.md" }), "allow");
  assert.equal(file("Edit", { file_path: "/repo/frontend/src/contracts.ts" }), "allow");
});

test(".env files are never read", () => {
  assert.equal(cmd("cat frontend/.env.development"), "deny");
  assert.equal(cmd("git diff -- frontend/.env"), "deny");
  assert.equal(cmd("Get-Content .env.local"), "deny");
  assert.equal(cmd("cat frontend/.env.example"), "allow");
  assert.equal(cmd("git rm --cached frontend/.env.development"), "allow");
  assert.equal(cmd("git status"), "allow");
  assert.equal(file("Read", { file_path: "D:\\Projets\\x\\frontend\\.env.development" }), "deny");
  assert.equal(file("Read", { file_path: "/repo/frontend/.env.example" }), "allow");
  assert.equal(file("Grep", { pattern: "API", glob: "**/.env*" }), "deny");
  assert.equal(file("Read", { file_path: "/repo/src/environment.ts" }), "allow");
});
