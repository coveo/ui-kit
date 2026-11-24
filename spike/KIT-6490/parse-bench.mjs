#!/usr/bin/env node
// Compares V8 compile time of two builds of the same bundle (no cache).
// Usage: node spike/KIT-6490/parse-bench.mjs <fileA> <fileB> [iterations]
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const [a, b, n = '40'] = process.argv.slice(2);
const sources = [a, b].map((file) => readFileSync(file, 'utf8'));
const times = [[], []];
for (let i = 0; i < Number(n); i++) {
  for (const j of i % 2 ? [1, 0] : [0, 1]) {
    const start = process.hrtime.bigint();
    new Script(`${sources[j]}\n//${i}`, {filename: `b${j}-${i}.js`});
    times[j].push(Number(process.hrtime.bigint() - start) / 1e6);
  }
}
const median = (xs) => xs.sort((x, y) => x - y)[Math.floor(xs.length / 2)];
console.info(`A ${a}: median ${median(times[0]).toFixed(2)} ms`);
console.info(`B ${b}: median ${median(times[1]).toFixed(2)} ms`);
