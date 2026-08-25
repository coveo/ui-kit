import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const turboTasks = [
  {
    task: '//#lint:check:oxlint',
    config: '.oxlintrc.json',
    buildInputs: buildLintTurboInputs,
  },
  {
    task: '//#lint:check:oxfmt',
    config: '.oxfmtrc.json',
    buildInputs: buildLintTurboInputs,
  },
  {
    task: '//#lint:fix:oxlint',
    config: '.oxlintrc.json',
    buildInputs: buildLintTurboInputs,
  },
  {
    task: '//#lint:fix:oxfmt',
    config: '.oxfmtrc.json',
    buildInputs: buildLintTurboInputs,
  },
  {
    task: '//#lint:check:cspell',
    config: '.cspell.json',
    buildInputs: buildCspellTurboInputs,
  },
];

function readJson(filePath, description) {
  if (!existsSync(filePath)) {
    throw new Error(`Required ${description} was not found at ${filePath}.`);
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Could not parse ${description} at ${filePath}: ${error.message}`, {
      cause: error,
    });
  }
}

function validateIgnorePatterns(config, configPath) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(`Expected ${configPath} to contain a JSON object.`);
  }

  if (!Array.isArray(config.ignorePatterns)) {
    throw new Error(`Expected ${configPath} to contain an ignorePatterns array.`);
  }

  return config.ignorePatterns.map((pattern, index) => {
    if (typeof pattern !== 'string' || pattern.length === 0 || pattern.trim() !== pattern) {
      throw new Error(
        `Unsupported ignore pattern at ${configPath}.ignorePatterns[${index}]: ${JSON.stringify(pattern)}`
      );
    }

    if (pattern === '!' || pattern.startsWith('!!') || pattern.includes('\n')) {
      throw new Error(
        `Unsupported ignore pattern at ${configPath}.ignorePatterns[${index}]: ${JSON.stringify(pattern)}`
      );
    }

    return pattern.startsWith('!') ? pattern.slice(1) : `!${pattern}`;
  });
}

export function buildLintTurboInputs(configPath, config) {
  return [configPath, '$TURBO_DEFAULT$', ...validateIgnorePatterns(config, configPath)];
}

function validateCspellIgnorePaths(config, configPath) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(`Expected ${configPath} to contain a JSON object.`);
  }

  if (!Array.isArray(config.ignorePaths)) {
    throw new Error(`Expected ${configPath} to contain an ignorePaths array.`);
  }

  return config.ignorePaths.map((pattern, index) => {
    if (typeof pattern !== 'string' || pattern.length === 0 || pattern.trim() !== pattern) {
      throw new Error(
        `Unsupported ignore path at ${configPath}.ignorePaths[${index}]: ${JSON.stringify(pattern)}`
      );
    }

    if (pattern === '!' || pattern.startsWith('!!') || pattern.includes('\n')) {
      throw new Error(
        `Unsupported ignore path at ${configPath}.ignorePaths[${index}]: ${JSON.stringify(pattern)}`
      );
    }

    if (pattern.startsWith('!')) {
      throw new Error(
        `Unsupported ignore path at ${configPath}.ignorePaths[${index}]: ${JSON.stringify(pattern)}`
      );
    }

    return pattern.includes('/') ? `!${pattern}` : `!**/${pattern}`;
  });
}

export function buildCspellTurboInputs(configPath, config) {
  return [configPath, '**/*.md', ...validateCspellIgnorePaths(config, configPath)];
}

function getTurboTask(turbo, task) {
  if (!turbo.tasks || typeof turbo.tasks !== 'object' || Array.isArray(turbo.tasks)) {
    throw new Error('Expected turbo.json to contain a tasks object.');
  }

  const taskDefinition = turbo.tasks[task];
  if (!taskDefinition || typeof taskDefinition !== 'object' || Array.isArray(taskDefinition)) {
    throw new Error(`Expected turbo.json to contain the ${task} task definition.`);
  }

  return taskDefinition;
}

function formatTurboConfig(turboPath, workingDirectory) {
  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  try {
    execFileSync(pnpm, ['exec', 'oxfmt', turboPath], {
      cwd: workingDirectory,
      stdio: 'inherit',
    });
  } catch (error) {
    throw new Error(`Failed to format ${turboPath} with Oxfmt: ${error.message}`, {
      cause: error,
    });
  }
}

export function generateTurboLintInputs({rootDirectory = rootDir, format = true} = {}) {
  const turboPath = resolve(rootDirectory, 'turbo.json');
  const turbo = readJson(turboPath, 'turbo.json');

  for (const {task, config: configName, buildInputs} of turboTasks) {
    const configPath = resolve(rootDirectory, configName);
    const config = readJson(configPath, configName);
    const taskDefinition = getTurboTask(turbo, task);
    taskDefinition.inputs = buildInputs(configName, config);
  }

  writeFileSync(turboPath, `${JSON.stringify(turbo, null, 2)}\n`);
  if (format) {
    formatTurboConfig(turboPath, rootDirectory);
  }

  return turbo;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  generateTurboLintInputs();
}
