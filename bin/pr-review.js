#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

function printUsage() {
  const message =
    "Usage: pr-review [options]\n\n" +
    "Options:\n" +
    "  --copilot          Install prompts for GitHub Copilot (default)\n" +
    "  --cursor           Install prompts for Cursor\n" +
    "  --lang <locale>    Language code stored in .review/config.yml (default: template value)\n" +
    "  -h, --help         Show this help message";
  console.log(message);
}

function parseArgs(argv) {
  const result = { lang: undefined, help: false, agent: undefined };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      result.help = true;
      continue;
    }
    if (arg === "--copilot") {
      if (result.agent) {
        throw new Error("Multiple agent options specified. Please specify only one.");
      }
      result.agent = "copilot";
      continue;
    }
    if (arg === "--cursor") {
      if (result.agent) {
        throw new Error("Multiple agent options specified. Please specify only one.");
      }
      result.agent = "cursor";
      continue;
    }
    if (arg === "--lang") {
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        throw new Error("Missing value for --lang option.");
      }
      result.lang = next;
      i += 1;
      continue;
    }
    if (arg.startsWith("--lang=")) {
      result.lang = arg.split("=", 2)[1];
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return result;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }
  ensureDirectory(destination);
  fs.cpSync(source, destination, { recursive: true, force: true });
}

function getAgentConfig(agentName) {
  const cwd = process.cwd();

  switch (agentName) {
    case "copilot":
      return {
        name: "github-copilot",
        promptDir: path.join(cwd, ".github", "prompts"),
        templateSubDir: "github",
      };
    case "cursor":
      return {
        name: "cursor",
        promptDir: path.join(cwd, ".cursor", "commands"),
        templateSubDir: "cursor",
      };
    default:
      throw new Error(`Unknown agent: ${agentName}`);
  }
}

function copyPromptsForAgent(templateRoot, agent) {
  const sourceDir = path.join(templateRoot, "prompts", agent.templateSubDir);

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`No template found for ${agent.name} at ${sourceDir}`);
  }

  copyDirectory(sourceDir, agent.promptDir);
  return { agent: agent.name, dir: agent.promptDir };
}

function loadTemplateConfig(templatePath) {
  if (!fs.existsSync(templatePath)) {
    return {};
  }
  const raw = fs.readFileSync(templatePath, "utf8");
  if (!raw.trim()) {
    return {};
  }
  try {
    return YAML.parse(raw) || {};
  } catch (error) {
    throw new Error(`Failed to parse template config at ${templatePath}: ${error.message}`);
  }
}

function loadExistingConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    return {};
  }
  const raw = fs.readFileSync(configPath, "utf8");
  if (!raw.trim()) {
    return {};
  }
  try {
    return YAML.parse(raw) || {};
  } catch (error) {
    throw new Error(`Failed to parse existing config at ${configPath}: ${error.message}`);
  }
}

function writeConfig(configPath, config) {
  const yaml = YAML.stringify(config);
  fs.writeFileSync(configPath, `${yaml.trimEnd()}\n`, "utf8");
}

function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (parsed.help) {
    printUsage();
    return;
  }
  try {
    const cwd = process.cwd();
    const reviewDir = path.join(cwd, ".review");
    ensureDirectory(reviewDir);

    const templateRoot = path.resolve(__dirname, "..", "templates");

    // Get agent configuration (default: copilot)
    const agentName = parsed.agent || "copilot";
    const agent = getAgentConfig(agentName);
    const copiedPrompt = copyPromptsForAgent(templateRoot, agent);

    const configTemplatePath = path.join(templateRoot, "config", "config.yml");
    const configPath = path.join(reviewDir, "config.yml");
    const templateConfig = loadTemplateConfig(configTemplatePath);
    const existingConfig = loadExistingConfig(configPath);
    const mergedConfig = { ...templateConfig, ...existingConfig };
    if (parsed.lang) {
      mergedConfig.lang = parsed.lang;
    } else if (!mergedConfig.lang) {
      mergedConfig.lang = templateConfig.lang || "en";
    }
    writeConfig(configPath, mergedConfig);

    console.log(`✅ PR review templates installed successfully`);
    console.log(`   Language set to '${mergedConfig.lang}' in ${configPath}`);
    console.log(`   Prompts copied to:`);
    console.log(`     - ${copiedPrompt.agent}: ${copiedPrompt.dir}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
