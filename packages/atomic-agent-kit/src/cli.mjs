#!/usr/bin/env node
import path from 'node:path';
import {parseArgs} from 'node:util';
import {generateKit, kitDirOf, readInputs, writeKit} from './generate.mjs';

const {positionals, values} = parseArgs({
  allowPositionals: true,
  options: {
    atomic: {type: 'string', default: process.cwd()},
    out: {type: 'string'},
  },
});
const [command = 'generate'] = positionals;

if (command !== 'generate') {
  console.error(
    `Unknown command "${command}". Usage: atomic-agent-kit generate [--atomic <dir>] [--out <dir>]`
  );
  process.exit(1);
}

const root = path.resolve(values.atomic);
const outDir = values.out ? path.resolve(values.out) : kitDirOf(root);
const files = generateKit(readInputs({root}));
writeKit(files, outDir);
console.log(`Wrote ${files.size} files to ${path.relative(process.cwd(), outDir) || '.'}`);
