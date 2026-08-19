import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {appendFileSync, existsSync, readdirSync, readFileSync, rmSync, statSync} from 'node:fs';
import {dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';

const iterations = 30;
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const atomicRoot = resolve(repositoryRoot, 'packages/atomic');
const bunExecutable = process.env.BUN_BIN;

if (!bunExecutable) {
  throw new Error('BUN_BIN must point to the Bun executable');
}

const runtimes = [
  {name: 'Node', executable: process.execPath},
  {name: 'Bun', executable: bunExecutable},
];
const tasks = [
  {
    name: 'build:locales',
    script: 'scripts/build-locales.mjs',
    outputs: ['src/assets/lang', 'src/generated', 'dist/lang'],
  },
  {
    name: 'build:assets',
    script: 'scripts/build-assets.mjs',
    outputs: ['dist/assets'],
  },
  {
    name: 'build:themes',
    script: 'scripts/build-themes.mjs',
    outputs: ['dist/themes'],
  },
];

function clean(task) {
  for (const output of task.outputs) {
    rmSync(resolve(atomicRoot, output), {recursive: true, force: true});
  }
}

function execute(runtime, task) {
  clean(task);
  const start = performance.now();
  const result = spawnSync(runtime.executable, [task.script], {
    cwd: atomicRoot,
    encoding: 'utf8',
  });
  const duration = performance.now() - start;

  if (result.status !== 0) {
    throw new Error(
      `${runtime.name} failed ${task.name}:\n${result.stdout ?? ''}\n${result.stderr ?? ''}`
    );
  }

  return duration;
}

function filesUnder(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function outputManifest(task) {
  return Object.fromEntries(
    task.outputs
      .flatMap((output) => filesUnder(resolve(atomicRoot, output)))
      .filter((path) => statSync(path).isFile())
      .sort()
      .map((path) => [
        relative(atomicRoot, path),
        createHash('sha256').update(readFileSync(path)).digest('hex'),
      ])
  );
}

function runtimeVersion(runtime) {
  const result = spawnSync(runtime.executable, ['--version'], {encoding: 'utf8'});
  if (result.status !== 0) {
    throw new Error(`Could not determine the ${runtime.name} version`);
  }
  return result.stdout.trim();
}

function median(values) {
  const sorted = values.toSorted((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function percentile(values, percentileValue) {
  const sorted = values.toSorted((left, right) => left - right);
  return sorted[Math.ceil(sorted.length * percentileValue) - 1];
}

function formatMilliseconds(value) {
  return `${value.toFixed(2)} ms`;
}

const equivalentOutputs = new Map();
for (const task of tasks) {
  execute(runtimes[0], task);
  const nodeManifest = outputManifest(task);
  execute(runtimes[1], task);
  equivalentOutputs.set(
    task.name,
    JSON.stringify(nodeManifest) === JSON.stringify(outputManifest(task))
  );
}

for (const runtime of runtimes) {
  for (const task of tasks) {
    execute(runtime, task);
  }
}

const samples = new Map(
  runtimes.flatMap((runtime) => tasks.map((task) => [`${runtime.name}:${task.name}`, []]))
);

for (let iteration = 0; iteration < iterations; iteration++) {
  const orderedRuntimes = iteration % 2 === 0 ? runtimes : runtimes.toReversed();
  const orderedTasks = [
    ...tasks.slice(iteration % tasks.length),
    ...tasks.slice(0, iteration % tasks.length),
  ];

  for (const task of orderedTasks) {
    for (const runtime of orderedRuntimes) {
      samples.get(`${runtime.name}:${task.name}`).push(execute(runtime, task));
    }
  }
}

const rows = tasks.map((task) => {
  const nodeSamples = samples.get(`Node:${task.name}`);
  const bunSamples = samples.get(`Bun:${task.name}`);
  const nodeMedian = median(nodeSamples);
  const bunMedian = median(bunSamples);

  return {
    task: task.name,
    nodeMedian,
    bunMedian,
    nodeP95: percentile(nodeSamples, 0.95),
    bunP95: percentile(bunSamples, 0.95),
    saved: nodeMedian - bunMedian,
    speedup: nodeMedian / bunMedian,
    equivalent: equivalentOutputs.get(task.name),
  };
});

const totalNodeMedian = rows.reduce((total, row) => total + row.nodeMedian, 0);
const totalBunMedian = rows.reduce((total, row) => total + row.bunMedian, 0);
const summary = [
  '# Atomic Node vs Bun benchmark',
  '',
  `- Runner: \`${process.platform}/${process.arch}\``,
  `- Node: \`${runtimeVersion(runtimes[0])}\``,
  `- Bun: \`${runtimeVersion(runtimes[1])}\``,
  `- Iterations: ${iterations} per runtime and task`,
  '',
  '| Task | Node median | Bun median | Node p95 | Bun p95 | Median saved | Speedup | Byte-identical |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | :---: |',
  ...rows.map(
    (row) =>
      `| \`${row.task}\` | ${formatMilliseconds(row.nodeMedian)} | ${formatMilliseconds(row.bunMedian)} | ${formatMilliseconds(row.nodeP95)} | ${formatMilliseconds(row.bunP95)} | ${formatMilliseconds(row.saved)} | ${row.speedup.toFixed(2)}x | ${row.equivalent ? 'yes' : 'no'} |`
  ),
  `| **Sequential total** | **${formatMilliseconds(totalNodeMedian)}** | **${formatMilliseconds(totalBunMedian)}** | | | **${formatMilliseconds(totalNodeMedian - totalBunMedian)}** | **${(totalNodeMedian / totalBunMedian).toFixed(2)}x** | |`,
  '',
  '> Turbo can run these tasks concurrently, so the sequential total is an upper bound. The slowest task is a closer approximation of critical-path savings.',
  '',
].join('\n');

console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}

if (rows.some((row) => !row.equivalent)) {
  process.exitCode = 1;
}
