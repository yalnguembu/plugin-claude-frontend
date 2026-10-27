// PreToolUse (Bash, PowerShell): git, contract and secret guards.
import { emitDecision, git, loadConfig, projectDir, readInput } from "./lib/config.mjs";
import { checkCommand } from "./lib/rules.mjs";

const input = await readInput();
const dir = input.cwd || projectDir(input);
const { config } = loadConfig(projectDir(input));
const branch = git(dir, ["branch", "--show-current"]);

emitDecision(checkCommand(input.tool_input?.command ?? "", { config, branch }));
