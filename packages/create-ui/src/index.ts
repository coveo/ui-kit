#!/usr/bin/env node
import {Command, CommanderError} from 'commander';
import {realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {argv} from 'node:process';
import {buildCrashReport, writeCrashReport} from './crash-report.js';
import {isExpectedError} from './errors.js';
import {log} from './log.js';
import {resolveInputs, scaffold, type CliArgs} from './scaffold.js';
import {submitReport} from './submit-report.js';
import {describeTemplate, getTemplates} from './templates.js';
import {buildCrashDisclosure, isTrackingDisabled} from './telemetry.js';
import {formatError} from './utils.js';

// TODO: (KIT-5833): add a link to the "How to use @coveo/create-ui" guide here
// once that documentation page is published.
const DOCS = `
Coveo documentation:

  Docs home   https://docs.coveo.com
  Atomic      https://docs.coveo.com/en/atomic/latest
  Headless    https://docs.coveo.com/en/headless/latest
`;

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
    .option(
      '--template-version <version>',
      'Headless/Atomic library version (or npm dist-tag) to scaffold (defaults to latest)'
    )
    .option('--docs', 'print links to the Coveo documentation')
    .addHelpText(
      'after',
      `\nAvailable templates:\n${getTemplates()
        .map((t) => `  ${t.name.padEnd(26)} ${describeTemplate(t)}`)
        .join(
          '\n'
        )}\n\nExamples:\n  $ npm create @coveo/ui my-app --template headless-search-react\n  $ npm create @coveo/ui my-app --template headless-search-react --template-version 3.2.1`
    )
    .showHelpAfterError()
    .exitOverride();
}

export function parseArgs(rawArgs: string[]): CliArgs {
  const program = buildProgram();
  program.parse(rawArgs, {from: 'user'});
  const opts = program.opts<{
    template?: string;
    templateVersion?: string;
    docs?: boolean;
  }>();
  const templateVersion = opts.templateVersion?.trim();
  return {
    projectName: program.args[0],
    template: opts.template,
    templateVersion:
      templateVersion !== undefined && templateVersion.length > 0
        ? templateVersion
        : undefined,
    docs: Boolean(opts.docs),
  };
}

export async function main(rawArgs: string[]): Promise<number> {
  if (rawArgs[0] === 'report') {
    return submitReport(rawArgs[1]);
  }

  let args: CliArgs;
  try {
    args = parseArgs(rawArgs);
  } catch (error) {
    if (error instanceof CommanderError) {
      return error.exitCode;
    }
    throw error;
  }

  if (args.docs) {
    log.info(DOCS);
    return 0;
  }

  const options = await resolveInputs(args);
  if (options === null) {
    return 1;
  }

  await scaffold(options);
  return 0;
}

const isDirectRun =
  argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === realpathSync(argv[1]);

/**
 * On an unexpected crash, capture a plain-JSON report and print how to submit
 * it (ADR 003). Handled outcomes ({@link isExpectedError}) and `DO_NOT_TRACK`
 * are skipped. Never throws — a reporting failure must not mask the original
 * error.
 */
export async function reportCrashIfUnexpected(error: unknown): Promise<void> {
  if (isExpectedError(error) || isTrackingDisabled()) {
    return;
  }
  try {
    const report = await buildCrashReport(error);
    const reportPath = await writeCrashReport(report);
    log.note(buildCrashDisclosure(reportPath), 'Crash report');
  } catch {
    // Best-effort: never let a reporting failure hide the real crash.
  }
}

if (isDirectRun) {
  const fail = async (error: unknown): Promise<never> => {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      log.info('\nAborted.');
      process.exit(130);
    }
    log.error(formatError(error));
    await reportCrashIfUnexpected(error);
    process.exit(1);
  };

  process.on('uncaughtException', (err) => void fail(err));
  process.on('unhandledRejection', (reason) => void fail(reason));

  main(argv.slice(2)).then((code) => process.exit(code), fail);
}
