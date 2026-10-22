import {spawn} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {kitDir} from '../generate.mjs';
import {packageRoot, readManifest} from '../manifest.mjs';
import {createCatalog} from '../snippets.mjs';
import {ARMS} from './arms.mjs';
import {checkLint, checkRender} from './check.mjs';
import {PROMPTS, promptText} from './prompts.mjs';

const {values: options} = parseArgs({
  options: {
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

const outDir = path.resolve(options.out);
const arms = options.arms.split(',');
const prompts =
  options.prompts === 'all'
    ? PROMPTS
    : PROMPTS.filter((prompt) => options.prompts.split(',').includes(prompt.id));
const runs = Number(options.runs);

/**
 * Runs `claude -p` in a workspace with only the file tools, and keeps the transcript.
 */
function runAgent(workspace, prompt) {
  const args = [
    '-p',
    promptText(prompt),
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
    'Read,Write,Edit,Glob,Grep,Skill',
    '--disallowedTools',
    'Bash,WebFetch,WebSearch,Task,NotebookEdit',
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
      });
    });
  });
}

async function runJob({arm, prompt, run}, catalog) {
  const jobDir = path.join(outDir, arm, prompt.id, String(run));
  const workspace = path.join(jobDir, 'workspace');
  const resultFile = path.join(jobDir, 'result.json');
  if (existsSync(resultFile)) {
    return JSON.parse(readFileSync(resultFile, 'utf8'));
  }
  rmSync(jobDir, {recursive: true, force: true});
  mkdirSync(workspace, {recursive: true});
  ARMS[arm].prepare(workspace, kitDir);

  const started = Date.now();
  const agent = await runAgent(workspace, prompt);
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
    '| Arm | Context | Runs | Lint pass | Render pass | Both | Skill or docs used | Median cost | Median time | Median turns |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const arm of arms) {
    const own = results.filter((result) => result.arm === arm);
    const used = own.filter(
      (result) => result.agent.skillInvoked || result.agent.referencesRead > 0
    ).length;
    lines.push(
      `| ${arm} | ${ARMS[arm].description} | ${own.length} | ${percent(own.filter((r) => r.lint.pass).length, own.length)} | ${percent(own.filter((r) => r.render.pass).length, own.length)} | **${percent(own.filter((r) => r.pass).length, own.length)}** | ${percent(used, own.length)} | $${(median(own.map((r) => r.agent.costUsd)) ?? 0).toFixed(2)} | ${Math.round((median(own.map((r) => r.agent.durationMs)) ?? 0) / 1000)} s | ${median(own.map((r) => r.agent.turns)) ?? '–'} |`
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

const catalog = createCatalog(readManifest());
if (!existsSync(kitDir)) {
  throw new Error(`Generate the kit first: pnpm run build:agent-kit (${kitDir} is missing)`);
}
const jobs = arms.flatMap((arm) =>
  prompts.flatMap((prompt) =>
    Array.from({length: runs}, (_, index) => ({arm, prompt, run: index + 1}))
  )
);
mkdirSync(outDir, {recursive: true});
console.log(`${jobs.length} runs → ${outDir}`);
const results = options['report-only']
  ? jobs
      .map((job) => path.join(outDir, job.arm, job.prompt.id, String(job.run), 'result.json'))
      .filter((file) => existsSync(file))
      .map((file) => JSON.parse(readFileSync(file, 'utf8')))
  : await runAll(jobs, (job) => runJob(job, catalog), Number(options.concurrency));
writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2));
writeFileSync(path.join(outDir, 'report.md'), renderReport(results));
console.log(`\n${renderReport(results)}`);
