// Bumps the plugin version (plugin.json) and dates the "Non publié" section of CHANGELOG.md.
// Usage: node scripts/bump-version.mjs patch|minor|major|X.Y.Z
import { readFileSync, writeFileSync } from "node:fs";

const PLUGIN = new URL("../.claude-plugin/plugin.json", import.meta.url);
const CHANGELOG = new URL("../CHANGELOG.md", import.meta.url);
const UNRELEASED = "## [Non publié]";

const arg = process.argv[2];
const plugin = JSON.parse(readFileSync(PLUGIN, "utf8"));
const [major, minor, patch] = plugin.version.split(".").map(Number);

const next =
  arg === "major" ? `${major + 1}.0.0`
  : arg === "minor" ? `${major}.${minor + 1}.0`
  : arg === "patch" ? `${major}.${minor}.${patch + 1}`
  : /^\d+\.\d+\.\d+$/.test(arg ?? "") ? arg
  : null;

if (!next) {
  console.error("Usage : node scripts/bump-version.mjs patch|minor|major|X.Y.Z");
  process.exit(1);
}

const changelog = readFileSync(CHANGELOG, "utf8");
const start = changelog.indexOf(UNRELEASED);
if (start < 0) {
  console.error(`CHANGELOG.md n'a pas de section « ${UNRELEASED} ».`);
  process.exit(1);
}
const body = changelog.slice(start + UNRELEASED.length).split(/\n## \[/)[0];
if (!body.trim()) {
  console.error("La section « Non publié » est vide : rien à publier.");
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
writeFileSync(CHANGELOG, changelog.replace(UNRELEASED, `${UNRELEASED}\n\n## [${next}] - ${date}`));
plugin.version = next;
writeFileSync(PLUGIN, JSON.stringify(plugin, null, 2) + "\n");

console.log(`${plugin.name} ${major}.${minor}.${patch} → ${next}`);
console.log(`Ensuite : commit « chore(release): ${next} » sur une branche, pull request vers develop,`);
console.log(`puis, après la fusion, l'étiquette v${next} sur develop.`);
