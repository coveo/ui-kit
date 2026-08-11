import {deepStrictEqual, ok, throws} from 'node:assert';
import {describe, it} from 'node:test';
import {sanitizeTurboSummary, TELEMETRY_SCHEMA_VERSION} from './turbo-telemetry.mjs';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** A realistic (trimmed) Turbo run summary, based on an actual `--summarize` output. */
function realisticSummary(overrides = {}) {
  return {
    id: '3HjfEznjrMXm0iYcDuf47T62uXH',
    version: '1',
    turboVersion: '2.10.2',
    monorepo: true,
    globalCacheInputs: {
      rootKey: 'I can’t see ya, but I know you’re here',
      files: {'package.json': 'b48dd4490d331d49d641d8d172c523351e1ccfbe'},
      hashOfExternalDependencies: '81455a7df39612f5',
      environmentVariables: {
        specified: {env: ['CI', 'NODE_ENV'], passThroughEnv: ['GITHUB_*']},
      },
    },
    packages: ['@coveo/bueno'],
    envMode: 'strict',
    frameworkInference: true,
    user: 'ci-runner-user',
    scm: {type: 'git', sha: 'deadbeefcafe', branch: 'renovate/some-dep'},
    execution: {
      command: 'turbo run test --filter=@coveo/bueno',
      repoPath: '',
      success: 2,
      failed: 0,
      cached: 0,
      attempted: 2,
      startTime: 1786386288275,
      endTime: 1786386290229,
      exitCode: 0,
    },
    tasks: [
      {
        taskId: '@coveo/bueno#build',
        task: 'build',
        package: '@coveo/bueno',
        hash: '72a0ec6b86daa4f0',
        inputs: {'src/index.ts': 'abc123'},
        hashOfExternalDependencies: '6e6ea34d1b64ad48',
        cache: {local: false, remote: false, status: 'MISS', timeSaved: 0},
        command: 'pnpm run build:bundles && pnpm run build:definitions',
        cliArguments: [],
        outputs: ['dist/**'],
        excludedOutputs: null,
        logFile: 'packages/bueno/.turbo/turbo-build.log',
        directory: 'packages/bueno',
        dependencies: [],
        dependents: ['@coveo/bueno#test'],
        with: [],
        environmentVariables: {specified: {env: [], passThroughEnv: null}},
        execution: {startTime: 1786386288401, endTime: 1786386289500, exitCode: 0},
      },
      {
        taskId: '@coveo/bueno#test',
        task: 'test',
        package: '@coveo/bueno',
        hash: 'df0079297291299e',
        inputs: {'src/schema.test.ts': 'def456'},
        cache: {local: false, remote: false, status: 'MISS', timeSaved: 0},
        command: 'vitest run',
        directory: 'packages/bueno',
        dependencies: ['@coveo/bueno#build'],
        dependents: [],
        execution: {startTime: 1786386289500, endTime: 1786386290229, exitCode: 0},
      },
    ],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('sanitizeTurboSummary — successful run', () => {
  it('extracts only the allowlisted fields, dropping everything else', () => {
    const result = sanitizeTurboSummary(realisticSummary());
    deepStrictEqual(Object.keys(result).sort(), [
      'affectedPackages',
      'cacheHits',
      'cacheMisses',
      'exitCode',
      'schemaVersion',
      'tasks',
      'totalDurationMs',
      'totalTasks',
    ]);
  });

  it('sets the current schema version', () => {
    const result = sanitizeTurboSummary(realisticSummary());
    deepStrictEqual(result.schemaVersion, TELEMETRY_SCHEMA_VERSION);
  });

  it('extracts affected packages, task count, and cache counts correctly', () => {
    const result = sanitizeTurboSummary(realisticSummary());
    deepStrictEqual(result.affectedPackages, ['@coveo/bueno']);
    deepStrictEqual(result.totalTasks, 2);
    deepStrictEqual(result.cacheHits, 0);
    deepStrictEqual(result.cacheMisses, 2);
    deepStrictEqual(result.exitCode, 0);
    deepStrictEqual(result.totalDurationMs, 1786386290229 - 1786386288275);
  });

  it('sanitizes each task to only taskId/task/package/cacheStatus/durationMs/exitCode', () => {
    const result = sanitizeTurboSummary(realisticSummary());
    for (const task of result.tasks) {
      deepStrictEqual(Object.keys(task).sort(), [
        'cacheStatus',
        'durationMs',
        'exitCode',
        'package',
        'task',
        'taskId',
      ]);
    }
    deepStrictEqual(result.tasks[0], {
      taskId: '@coveo/bueno#build',
      task: 'build',
      package: '@coveo/bueno',
      cacheStatus: 'MISS',
      durationMs: 1786386289500 - 1786386288401,
      exitCode: 0,
    });
  });
});

describe('sanitizeTurboSummary — cache hits', () => {
  it('reports cacheStatus HIT and counts it correctly', () => {
    const summary = realisticSummary();
    summary.tasks[0].cache.status = 'HIT';
    summary.tasks[0].cache.local = true;
    const result = sanitizeTurboSummary(summary);
    deepStrictEqual(result.cacheHits, 1);
    deepStrictEqual(result.cacheMisses, 1);
    deepStrictEqual(result.tasks[0].cacheStatus, 'HIT');
  });

  it('a fully-cached task with no execution timing reports durationMs=0, not a crash', () => {
    const summary = realisticSummary();
    summary.tasks[0].cache.status = 'HIT';
    summary.tasks[0].execution = undefined;
    const result = sanitizeTurboSummary(summary);
    deepStrictEqual(result.tasks[0].durationMs, 0);
    deepStrictEqual(result.tasks[0].exitCode, 0);
  });
});

describe('sanitizeTurboSummary — failed run', () => {
  it('reports a nonzero top-level exitCode from a failed task', () => {
    const summary = realisticSummary();
    summary.execution.exitCode = 1;
    summary.execution.failed = 1;
    summary.tasks[1].execution.exitCode = 1;
    const result = sanitizeTurboSummary(summary);
    deepStrictEqual(result.exitCode, 1);
    deepStrictEqual(result.tasks[1].exitCode, 1);
  });
});

describe('sanitizeTurboSummary — interrupted/incomplete run', () => {
  it('treats an empty tasks array as zero tasks without throwing', () => {
    const summary = realisticSummary({tasks: []});
    const result = sanitizeTurboSummary(summary);
    deepStrictEqual(result.totalTasks, 0);
    deepStrictEqual(result.cacheHits, 0);
    deepStrictEqual(result.cacheMisses, 0);
  });

  it('skips a malformed (non-object) entry inside the tasks array', () => {
    const summary = realisticSummary();
    summary.tasks.push(null, 'not-a-task', 42);
    const result = sanitizeTurboSummary(summary);
    deepStrictEqual(result.totalTasks, 2);
  });

  it('defaults a task missing cache info to MISS rather than throwing', () => {
    const summary = realisticSummary();
    summary.tasks[0].cache = undefined;
    const result = sanitizeTurboSummary(summary);
    deepStrictEqual(result.tasks[0].cacheStatus, 'MISS');
  });
});

describe('sanitizeTurboSummary — malformed input rejection', () => {
  it('throws on null input', () => {
    throws(() => sanitizeTurboSummary(null));
  });

  it('throws on a non-object primitive', () => {
    throws(() => sanitizeTurboSummary('not an object'));
    throws(() => sanitizeTurboSummary(42));
  });

  it('throws when execution is missing', () => {
    const summary = realisticSummary();
    delete summary.execution;
    throws(() => sanitizeTurboSummary(summary));
  });

  it('throws when tasks is missing', () => {
    const summary = realisticSummary();
    delete summary.tasks;
    throws(() => sanitizeTurboSummary(summary));
  });

  it('throws when packages is missing', () => {
    const summary = realisticSummary();
    delete summary.packages;
    throws(() => sanitizeTurboSummary(summary));
  });
});

describe('sanitizeTurboSummary — secret/forbidden-field rejection', () => {
  const FORBIDDEN_SUBSTRINGS = [
    'rootKey',
    'ci-runner-user',
    'renovate/some-dep',
    'deadbeefcafe',
    'GITHUB_*',
    'hashOfExternalDependencies',
    'inputs',
    'environmentVariables',
    'logFile',
    'directory',
    'command',
    'globalCacheInputs',
  ];

  it('never includes user, scm, globalCacheInputs, environment variable names, file hashes, log paths, or raw commands in the output', () => {
    const result = sanitizeTurboSummary(realisticSummary());
    const serialized = JSON.stringify(result);
    for (const forbidden of FORBIDDEN_SUBSTRINGS) {
      ok(
        !serialized.includes(forbidden),
        `sanitized output must not contain "${forbidden}", but it did: ${serialized}`
      );
    }
  });

  it("never includes raw file paths from a task's inputs/outputs/logFile", () => {
    const summary = realisticSummary();
    summary.tasks[0].inputs = {'/Users/someone/secret-path/file.ts': 'hash'};
    summary.tasks[0].logFile = '/Users/someone/secret-path/.turbo/turbo-build.log';
    const result = sanitizeTurboSummary(summary);
    const serialized = JSON.stringify(result);
    ok(!serialized.includes('secret-path'));
  });
});
