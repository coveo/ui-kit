#!/usr/bin/env node
import minimist from 'minimist';
import {mkdtemp, rm, readdir, access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {argv} from 'node:process';
import {downloadTemplate} from './download.js';
import {resolveSampleDependencies} from './resolve-deps.js';
import {finalizeProject, installDependencies} from './setup.js';
import {availableTemplates, getTemplate, type Template} from './templates.js';
import {detectPackageManager, log} from './utils.js';

const HELP = `
Usage: npm create @coveo/ui <project-name> --template <name>

Scaffold a Coveo UI project from the official samples. Runs with zero
configuration against the sample organization — no credentials required.

Options:
  --template <name>   Template to scaffold
  -h, --help          Show this help

Available templates:
${availableTemplates()
  .map((t) => `  ${t.name.padEnd(26)} ${t.description}`)
  .join('\n')}

Example:
  npm create @coveo/ui my-app --template headless-search-react
`;

export interface CliArgs {
  projectName?: string;
  template?: string;
  help: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const parsed = minimist(argv, {
    string: ['template'],
    boolean: ['help'],
    alias: {h: 'help'},
  });
  return {
    projectName: parsed._[0],
    template: parsed.template,
    help: Boolean(parsed.help),
  };
}

async function isEmptyOrMissing(dir: string): Promise<boolean> {
  try {
    await access(dir);
  } catch {
    return true; // missing
  }
  const entries = await readdir(dir);
  return entries.length === 0;
}

/** Downloads, resolves, finalizes, and installs the chosen template. */
export async function scaffold(
  template: Template,
  projectName: string
): Promise<void> {
  const targetDir = resolve(process.cwd(), projectName);
  const tempDir = await mkdtemp(join(tmpdir(), 'create-ui-'));

  try {
    log.step(`Downloading the "${template.name}" template…`);
    const sampleDir = await downloadTemplate({
      samplePath: template.path,
      destDir: tempDir,
    });

    log.step('Resolving dependencies…');
    await resolveSampleDependencies({sampleDir, treeRoot: tempDir});

    log.step(`Creating project in ${targetDir}…`);
    await finalizeProject({sampleDir, targetDir, projectName});
  } catch (error) {
    // Remove any partially-created target directory (it was empty/missing
    // before scaffolding started, so this is safe).
    await rm(targetDir, {recursive: true, force: true});
    throw error;
  } finally {
    await rm(tempDir, {recursive: true, force: true});
  }

  const pm = detectPackageManager();
  log.step(`Installing dependencies with ${pm}…`);
  const installed = installDependencies(targetDir, pm);

  log.step('Done!');
  log.info(`\n  cd ${projectName}`);
  if (!installed) {
    log.warn(`Dependency installation failed — run "${pm} install" manually.`);
  }
  log.info(`  ${pm} run dev\n`);
}

export async function main(argv: string[]): Promise<number> {
  const args = parseArgs(argv);

  if (args.help) {
    log.info(HELP);
    return 0;
  }

  // Interactive selection is added in a follow-up PR; for now --template and a
  // project name are required.
  if (args.template === undefined) {
    log.error('Please provide a template with --template.');
    log.info(HELP);
    return 1;
  }

  const template = getTemplate(args.template);
  if (!template) {
    log.error(`Unknown template "${args.template}".`);
    log.info(
      `\nAvailable templates:\n${availableTemplates()
        .map((t) => `  ${t.name}`)
        .join('\n')}`
    );
    return 1;
  }
  if (!template.available) {
    log.error(`Template "${args.template}" is not available yet.`);
    return 1;
  }

  if (!args.projectName) {
    log.error('Please provide a project name.');
    log.info(
      `\nExample: npm create @coveo/ui my-app --template ${template.name}`
    );
    return 1;
  }

  const targetDir = resolve(process.cwd(), args.projectName);
  if (!(await isEmptyOrMissing(targetDir))) {
    log.error(
      `Target directory "${args.projectName}" already exists and is not empty.`
    );
    return 1;
  }

  await scaffold(template, args.projectName);
  return 0;
}

const isDirectRun =
  argv[1] !== undefined && fileURLToPath(import.meta.url) === argv[1];

if (isDirectRun) {
  main(argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  );
}
