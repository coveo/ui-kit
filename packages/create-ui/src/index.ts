#!/usr/bin/env node
import minimist from 'minimist';
import {fileURLToPath} from 'node:url';
import {argv} from 'node:process';
import {availableTemplates, getTemplate} from './templates.js';
import {log} from './utils.js';

const HELP = `
Usage: npm create @coveo/ui <project-name> [options]

Scaffold a Coveo UI project from the official samples. Runs with zero
configuration against the sample organization — no credentials required.

Options:
  --template <name>   Template to scaffold (skips the interactive prompt)
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

export async function main(argv: string[]): Promise<number> {
  const args = parseArgs(argv);

  if (args.help) {
    log.info(HELP);
    return 0;
  }

  // A `--template` value, when provided, must reference a known, available
  // template. Scaffolding itself is wired in a follow-up PR.
  if (args.template !== undefined) {
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
  }

  log.info(HELP);
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
