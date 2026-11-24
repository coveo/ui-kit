#!/usr/bin/env node
// Prints markdown tables comparing measurement results.
// Usage: node spike/KIT-6490/table.mjs <package> <baseline-label> <label> [<label> ...]
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [pkg, baseLabel, ...labels] = process.argv.slice(2);
const load = (label) => JSON.parse(readFileSync(join(here, 'results', `${label}.json`), 'utf8'))[pkg];
const base = load(baseLabel);
const others = labels.map((label) => [label, load(label)]);

const kb = (bytes) => (bytes / 1000).toFixed(2);
const delta = (after, before) => {
  const d = after - before;
  return `${d > 0 ? '+' : ''}${kb(d)}`;
};

const header = ['Output', `${baseLabel} raw`, `${baseLabel} gzip`];
for (const [label] of others) {
  header.push(`${label} Δ raw`, `${label} Δ gzip`);
}
console.info(`| ${header.join(' | ')} |`);
console.info(`| ${header.map((_, i) => (i === 0 ? '---' : '---:')).join(' | ')} |`);
for (const key of Object.keys(base)) {
  const row = [`\`${key}\``, kb(base[key].raw), kb(base[key].gzip)];
  for (const [, result] of others) {
    row.push(delta(result[key].raw, base[key].raw), delta(result[key].gzip, base[key].gzip));
  }
  console.info(`| ${row.join(' | ')} |`);
}
