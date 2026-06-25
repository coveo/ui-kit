#!/usr/bin/env node
import {Command, CommanderError} from 'commander';
import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {argv} from 'node:process';
import {downloadTemplate} from './download.js';
import {isEmptyOrMissing} from './fs-utils.js';
import {finalizeProject, installDependencies} from './setup.js';
import {getTemplate, getTemplates, type Template} from './templates.js';
import {formatError, getPackageManager, log} from './utils.js';

// TODO: (KIT-5833): add a link to the "How to use @coveo/create-ui" guide here
// once that documentation page is published.
const DOCS = `
Coveo documentation:

  Docs home   https://docs.coveo.com
  Atomic      https://docs.coveo.com/en/atomic/latest
  Headless    https://docs.coveo.com/en/headless/latest
`;

export interface CliArgs {
  projectName?: string;
  template?: string;
  docs: boolean;
}

/**
 * Builds the commander program. `commander` owns usage/`--help` generation,
 * option parsing, and unknown-option errors; domain validation (known
 * template, project name) stays in `main`. `exitOverride` turns commander's
 * `process.exit` into a thrown `CommanderError` so the CLI stays testable.
 */
function buildProgram(): Command {
  return new Command()
    .name('create-ui')
    .usage('<project-name> --template <name>')
    .description(
      'Scaffold a Coveo UI project from the official samples. Runs with zero ' +
        'configuration against the sample organization — no credentials required.'
    )
    .argument('[project-name]', 'name (and directory) of the project to create')
    .option(
      '--template <name>',
      'template to scaffold (skips the interactive prompt)'
    )
    .option('--docs', 'print links to the Coveo documentation')
    .addHelpText(
      'after',
      `\nAvailable templates:\n${getTemplates()
        .map((t) => `  ${t.name.padEnd(26)} ${t.description}`)
        .join(
          '\n'
        )}\n\nExample:\n  $ npm create @coveo/ui my-app --template headless-search-react`
    )
    .showHelpAfterError()
    .exitOverride();
}

export function parseArgs(rawArgs: string[]): CliArgs {
  const program = buildProgram();
  program.parse(rawArgs, {from: 'user'});
  const opts = program.opts<{
    template?: string;
    docs?: boolean;
  }>();
  return {
    projectName: program.args[0],
    template: opts.template,
    docs: Boolean(opts.docs),
  };
}

/**
 * Atomically claims the target directory. Returns true if this call created it
 * (so it is safe to remove on failure), or false if it already existed and is
 * empty (pre-existing — must not be deleted). Throws if it exists and is not
 * empty. A single `mkdir` avoids the check-then-create TOCTOU race.
 */
async function claimTargetDir(targetDir: string): Promise<boolean> {
  const firstCreated = await mkdir(targetDir, {recursive: true});
  if (firstCreated !== undefined) {
    return true;
  }
  if (!(await isEmptyOrMissing(targetDir))) {
    throw new Error(
      `Target directory "${targetDir}" already exists and is not empty.`
    );
  }
  return false;
}

/** Downloads, resolves, finalizes, and installs the chosen template. */
export async function scaffold(
  template: Template,
  projectName: string
): Promise<void> {
  const targetDir = resolve(process.cwd(), projectName);
  const tempDir = await mkdtemp(join(tmpdir(), 'create-ui-'));
  let createdTargetDir = false;

  try {
    log.step(`Downloading the "${template.name}" template…`);
    const sampleDir = await downloadTemplate({
      packageName: template.packageName,
      destDir: tempDir,
    });

    log.step(`Creating project in ${targetDir}…`);
    createdTargetDir = await claimTargetDir(targetDir);
    await finalizeProject({sampleDir, targetDir, projectName});
  } catch (error) {
    if (createdTargetDir) {
      await rm(targetDir, {recursive: true, force: true});
    }
    throw error;
  } finally {
    await rm(tempDir, {recursive: true, force: true});
  }

  const pm = getPackageManager();
  log.step(`Installing dependencies with ${pm}…`);
  const installed = installDependencies(targetDir);

  log.step('Done!');
  log.info(`\n  cd ${projectName}`);
  if (!installed) {
    log.warn(`Dependency installation failed — run "${pm} install" manually.`);
  }
  log.info(`  ${pm} run dev\n`);
}

export async function main(rawArgs: string[]): Promise<number> {
  let args: CliArgs;
  try {
    args = parseArgs(rawArgs);
  } catch (error) {
    // `exitOverride` makes commander throw instead of calling process.exit.
    // `--help` exits 0 (commander already printed help); parse errors exit
    // non-zero (commander already printed the message + usage).
    if (error instanceof CommanderError) {
      return error.exitCode;
    }
    throw error;
  }

  if (args.docs) {
    log.info(DOCS);
    return 0;
  }

  // Interactive selection is added in a follow-up PR; for now --template and a
  // project name are required.
  if (args.template === undefined) {
    log.error('Please provide a template with --template (or run --help).');
    log.info(
      `\nAvailable templates:\n${getTemplates()
        .map((t) => `  ${t.name}`)
        .join('\n')}`
    );
    return 1;
  }

  const template = getTemplate(args.template);
  if (!template) {
    log.error(`Unknown template "${args.template}".`);
    log.info(
      `\nAvailable templates:\n${getTemplates()
        .map((t) => `  ${t.name}`)
        .join('\n')}`
    );
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
  process.on('uncaughtException', (err) => {
    log.error(formatError(err));
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    log.error(formatError(reason));
    process.exit(1);
  });

  main(argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      log.error(formatError(error));
      process.exit(1);
    }
  );
}
