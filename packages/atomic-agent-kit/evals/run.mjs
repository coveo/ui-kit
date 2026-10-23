import {spawn} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {kitDirOf} from '../src/generate.mjs';
import {readManifest} from '../src/manifest.mjs';
import {createCatalog, findSourceTags} from '../src/snippets.mjs';
import {atomicRoot} from '../src/testing/analyze.mjs';
import {ARMS} from './arms.mjs';
import {checkLint, checkRender} from './check.mjs';
import {preparePackages} from './packages.mjs';
import {PROMPTS, promptText} from './prompts.mjs';

const {values: options} = parseArgs({
  options: {
    atomic: {type: 'string', default: atomicRoot},
    'atomic-version': {type: 'string', default: 'latest'},
    runs: {type: 'string', default: '3'},
    arms: {type: 'string', default: Object.keys(ARMS).join(',')},
    prompts: {type: 'string', default: 'all'},
    concurrency: {type: 'string', default: '3'},
    model: {type: 'string', default: 'claude-sonnet-5-5'},
    budget: {type: 'string', default: '1'},
    out: {
      type: 'string',
      default: path.join(
        os.tmpdir(),
        'atomic-agent-kit-evals',
        new Date().toISOString().replaceAll(':', '-')
      ),
    },
    'report-only': {type: 'boolean', default: false},
  },
});

const root = path.resolve(options.atomic);
const kitDir = kitDirOf(root);
const outDir = path.resolve(options.out);
const arms = options.arms.split(',');
const prompts =
  options.prompts === 'all'
    ? PROMPTS
    : PROMPTS.filter((prompt) => options.prompts.split(',').includes(prompt.id));
const runs = Number(options.runs);

const FILE_TOOLS = ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Skill'];
const WEB_TOOLS = ['WebFetch', 'WebSearch'];

/**
 * Runs `claude -p` in a workspace with the file tools, plus the web tools for arms that allow
 * them, and keeps the transcript.
 */
function runAgent(workspace, prompt, arm) {
  const {web} = ARMS[arm];
  const args = [
    '-p',
    promptText(prompt, ARMS[arm].prompt),
    '--model',
    options.model,
    '--output-format',
    'stream-json',
    '--verbose',
    '--no-session-persistence',
    '--setting-sources',
    'project',
    '--max-turns',
    '40',
    '--max-budget-usd',
    options.budget,
    '--allowedTools',
    [...FILE_TOOLS, ...(web ? WEB_TOOLS : [])].join(','),
    '--disallowedTools',
    ['Bash', 'Task', 'NotebookEdit', ...(web ? [] : WEB_TOOLS)].join(','),
  ];
  return new Promise((resolve) => {
    const child = spawn('claude', args, {
      cwd: workspace,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (code) => {
      writeFileSync(path.join(workspace, '..', 'transcript.jsonl'), output);
      const events = output
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      const toolUses = events
        .filter((event) => event.type === 'assistant')
        .flatMap((event) => event.message?.content ?? [])
        .filter((block) => block.type === 'tool_use')
        .map((block) => ({name: block.name, input: block.input}));
      const result = events.find((event) => event.type === 'result') ?? {};
      const inputOf = (use) => JSON.stringify(use.input ?? {});
      const fetches = toolUses.filter((use) => use.name === 'WebFetch');
      resolve({
        exitCode: code,
        isError: Boolean(result.is_error) || code !== 0,
        stderr: stderr.slice(0, 500),
        costUsd: result.total_cost_usd ?? null,
        durationMs: result.duration_ms ?? null,
        turns: result.num_turns ?? null,
        toolUses,
        skillInvoked: toolUses.some(
          (use) => use.name === 'Skill' && /coveo-atomic/.test(JSON.stringify(use.input))
        ),
        referencesRead: toolUses.filter(
          (use) => use.name === 'Read' && /coveo-atomic/.test(JSON.stringify(use.input))
        ).length,
        manifestReads: toolUses.filter(
          (use) => use.name === 'Read' && /custom-elements\.json/.test(inputOf(use))
        ).length,
        packageLookups: toolUses.filter(
          (use) =>
            ['Read', 'Glob', 'Grep'].includes(use.name) &&
            /node_modules\/@coveo\/atomic/.test(inputOf(use))
        ).length,
        webSearches: toolUses.filter((use) => use.name === 'WebSearch').length,
        webFetches: fetches.length,
        fetchedHosts: [
          ...new Set(
            fetches.map((use) => {
              try {
                return new URL(use.input.url).host;
              } catch {
                return 'invalid URL';
              }
            })
          ),
        ],
      });
    });
  });
}

async function runJob({arm, prompt, run}, catalog, context) {
  const jobDir = path.join(outDir, arm, prompt.id, String(run));
  const workspace = path.join(jobDir, 'workspace');
  const resultFile = path.join(jobDir, 'result.json');
  if (existsSync(resultFile)) {
    return JSON.parse(readFileSync(resultFile, 'utf8'));
  }
  rmSync(jobDir, {recursive: true, force: true});
  mkdirSync(workspace, {recursive: true});
  ARMS[arm].prepare(workspace, context);

  const started = Date.now();
  const agent = await runAgent(workspace, prompt, arm);
  const lint = checkLint(workspace, catalog);
  const render = await checkRender(workspace, prompt.api);
  const result = {
    arm,
    prompt: prompt.id,
    run,
    pass: lint.pass && render.pass,
    lint,
    render,
    agent,
    wallMs: Date.now() - started,
  };
  writeFileSync(resultFile, JSON.stringify(result, null, 2));
  console.log(
    `${result.pass ? 'PASS' : 'FAIL'} ${arm}/${prompt.id}/${run}` +
      (result.pass ? '' : ` — ${lint.problems[0] ?? render.reason}`) +
      ` ($${agent.costUsd?.toFixed(2) ?? '?'}, ${Math.round((agent.durationMs ?? 0) / 1000)} s)`
  );
  return result;
}

async function runAll(jobs, worker, concurrency) {
  const results = [];
  let next = 0;
  await Promise.all(
    Array.from({length: Math.min(concurrency, jobs.length)}, async () => {
      while (next < jobs.length) {
        const job = jobs[next++];
        results.push(await worker(job));
      }
    })
  );
  return results;
}

const median = (values) => {
  const sorted = values
    .filter((value) => value !== null && value !== undefined)
    .toSorted((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
};

const percent = (part, total) => (total ? `${Math.round((100 * part) / total)}%` : '–');

function renderReport(results) {
  const lines = [
    '# Atomic agent kit eval',
    '',
    `Model \`${options.model}\`, ${runs} run(s) per prompt, ${prompts.length} prompts, ${results.length} runs in all. A run passes when the lint accepts \`index.html\` and the page renders items without an \`atomic-component-error\`, against the mocked platform API.`,
    '',
    '| Arm | Prompt | Context | Runs | Lint pass | Render pass | Both | Skill or docs used | Manifest read | Web fetch | Median cost | Median time | Median turns |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const arm of arms) {
    const own = results.filter((result) => result.arm === arm);
    const share = (test) => percent(own.filter(test).length, own.length);
    lines.push(
      `| ${arm} | ${ARMS[arm].prompt} | ${ARMS[arm].description} | ${own.length} | ${share((r) => r.lint.pass)} | ${share((r) => r.render.pass)} | **${share((r) => r.pass)}** | ${share((r) => r.agent.skillInvoked || r.agent.referencesRead > 0)} | ${share((r) => r.agent.manifestReads > 0)} | ${ARMS[arm].web ? share((r) => r.agent.webFetches > 0) : '–'} | $${(median(own.map((r) => r.agent.costUsd)) ?? 0).toFixed(2)} | ${Math.round((median(own.map((r) => r.agent.durationMs)) ?? 0) / 1000)} s | ${median(own.map((r) => r.agent.turns)) ?? '–'} |`
    );
  }
  lines.push(
    '',
    '## Pass rate per prompt',
    '',
    `| Prompt | ${arms.join(' | ')} |`,
    `| --- | ${arms.map(() => '---').join(' | ')} |`
  );
  for (const prompt of prompts) {
    const cells = arms.map((arm) => {
      const own = results.filter((result) => result.arm === arm && result.prompt === prompt.id);
      return `${own.filter((r) => r.pass).length}/${own.length}`;
    });
    lines.push(`| ${prompt.id} | ${cells.join(' | ')} |`);
  }
  lines.push('', '## Why runs failed', '');
  for (const arm of arms) {
    const reasons = {};
    for (const result of results.filter((r) => r.arm === arm && !r.pass)) {
      const reason = result.lint.pass
        ? `render: ${result.render.reason}`
        : `lint: ${result.lint.problems[0].replace(/^index\.html:\d+ /, '')}`;
      reasons[reason] = (reasons[reason] ?? 0) + 1;
    }
    const top = Object.entries(reasons)
      .toSorted((a, b) => b[1] - a[1])
      .slice(0, 8);
    lines.push(
      `### ${arm}`,
      '',
      ...(top.length ? top.map(([reason, n]) => `- ${n}× ${reason}`) : ['- none']),
      ''
    );
  }
  return lines.join('\n');
}

/**
 * Claude Code loads CLAUDE.md and AGENTS.md from every folder above its working directory, so
 * a workspace inside a repository would see that repository's instructions.
 */
function assertNoInheritedInstructions(dir) {
  for (let current = dir; ; current = path.dirname(current)) {
    for (const name of ['CLAUDE.md', 'CLAUDE.local.md', 'AGENTS.md']) {
      const file = path.join(current, name);
      if (existsSync(file)) {
        throw new Error(`Use an --out folder outside any project: the agent would load ${file}`);
      }
    }
    if (current === path.dirname(current)) {
      return;
    }
  }
}

const catalog = createCatalog(readManifest(root), findSourceTags(root));
if (!existsSync(kitDir)) {
  throw new Error(
    `Generate the kit first: pnpm --filter @coveo/atomic build:agent-kit (${kitDir} is missing)`
  );
}
assertNoInheritedInstructions(outDir);
const jobs = arms.flatMap((arm) =>
  prompts.flatMap((prompt) =>
    Array.from({length: runs}, (_, index) => ({arm, prompt, run: index + 1}))
  )
);
mkdirSync(outDir, {recursive: true});
console.log(`${jobs.length} runs → ${outDir}`);
const needsPackages = !options['report-only'] && arms.some((arm) => ARMS[arm].prompt === 'neutral');
const packages = needsPackages
  ? preparePackages(outDir, {kitDir, atomicRoot: root, version: options['atomic-version']})
  : null;
if (packages) {
  console.log(`@coveo/atomic ${packages.version} from npm, with and without the kit`);
}
const results = options['report-only']
  ? jobs
      .map((job) => path.join(outDir, job.arm, job.prompt.id, String(job.run), 'result.json'))
      .filter((file) => existsSync(file))
      .map((file) => JSON.parse(readFileSync(file, 'utf8')))
  : await runAll(
      jobs,
      (job) => runJob(job, catalog, {kitDir, packages}),
      Number(options.concurrency)
    );
writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2));
writeFileSync(path.join(outDir, 'report.md'), renderReport(results));
console.log(`\n${renderReport(results)}`);
