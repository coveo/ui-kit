#!/usr/bin/env node
import minimist from 'minimist';
import {mkdtemp, rm, readdir, access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {argv} from 'node:process';
import {getTemplate, getTemplates} from './templates.js';
import {log} from './utils.js';

const HELP = `
Usage: npm create @coveo/ui <project-name> --template <name>

Scaffold a Coveo UI project from the official samples. Runs with zero
configuration against the sample organization — no credentials required.

Options:
  --template <name>   Template to scaffold (skips the interactive prompt)
  --docs              Print links to the Coveo documentation
  -h, --help          Show this help

Available templates:
${getTemplates()
  .map((t) => `  ${t.name.padEnd(26)} ${t.description}`)
  .join('\n')}

Example:
  npm create @coveo/ui my-app --template headless-search-react
`;

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
  help: boolean;
  docs: boolean;
}

export function parseArgs(rawArgs: string[]): CliArgs {
  const parsed = minimist(rawArgs, {
    string: ['template'],
    boolean: ['help', 'docs'],
    alias: {h: 'help'},
  });
  return {
    projectName: parsed._[0],
    template: parsed.template,
    help: Boolean(parsed.help),
    docs: Boolean(parsed.docs),
  };
}

export async function main(rawArgs: string[]): Promise<number> {
  const args = parseArgs(rawArgs);

  if (args.help) {
    log.info(HELP);
    return 0;
  }

  if (args.docs) {
    log.info(DOCS);
    return 0;
  }

  // A `--template` value, when provided, must reference a known, available
  // template. Scaffolding itself is wired in a follow-up PR.
  if (args.template !== undefined) {
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
