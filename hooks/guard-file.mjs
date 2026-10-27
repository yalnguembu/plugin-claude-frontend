// PreToolUse (Read, Edit, Write, Grep…): no .env file, nothing written in read-only paths.
import { emitDecision, loadConfig, projectDir, readInput } from "./lib/config.mjs";
import { checkFile } from "./lib/rules.mjs";

const input = await readInput();
const dir = projectDir(input);
const { config } = loadConfig(dir);

emitDecision(checkFile(input.tool_name, input.tool_input, { config, dir }));
