// Simple ad-hoc script to help development of resolve-tasks.mjs
import {execFileSync, spawnSync} from 'node:child_process';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const directory = dirname(fileURLToPath(import.meta.url));
const resolver = resolve(directory, 'resolve-tasks.mjs');
const workspace = resolve(directory, '../../..');
const skippedWarning = /^::warning title=Skipped affected task::(\S+) is not in this checkout/;
const run = (name, environment, expected, expectedSkipped = []) => {
  const {status, stdout, stderr} = spawnSync(process.execPath, [resolver], {
    cwd: workspace,
    env: {...process.env, GITHUB_WORKSPACE: workspace, ...environment},
    encoding: 'utf8',
  });
  assert.equal(status, 0, `${name}: ${stderr}`);
  assert.equal(stdout.trim(), expected.join('\n'), name);
  const skipped = stderr
    .split('\n')
    .map((line) => line.match(skippedWarning)?.[1])
    .filter(Boolean);
  assert.deepEqual(skipped, expectedSkipped, `${name} (skipped)`);
};
const runFailure = (name, environment, expectedError) => {
  assert.throws(
    () =>
      execFileSync(process.execPath, [resolver], {
        cwd: workspace,
        env: {...process.env, GITHUB_WORKSPACE: workspace, ...environment},
        stdio: ['ignore', 'pipe', 'pipe'],
      }),
    (error) => {
      assert.match(error.stderr.toString(), expectedError, name);
      return true;
    }
  );
};
run(
  'matches an exact project filter',
  {
    TASKS: 'publint',
    PACKAGES: '@coveo/atomic',
    AFFECTED_TASKS: '["@coveo/atomic#publint", "@coveo/headless#publint"]',
  },
  ['@coveo/atomic#publint']
);
run(
  'matches project-name wildcards',
  {
    TASKS: 'publint',
    PACKAGES: '@coveo/atomic*',
    AFFECTED_TASKS:
      '["@coveo/atomic#publint", "@coveo/atomic-react#publint", "@coveo/headless#publint"]',
  },
  ['@coveo/atomic#publint', '@coveo/atomic-react#publint']
);
run(
  'subtracts multiple negated project-name filters',
  {
    TASKS: 'build\npublint',
    PACKAGES: '!@samples/*\n!@coveo/ui-kit-sample-*',
    AFFECTED_TASKS:
      '["@coveo/atomic#publint", "@coveo/ui-kit-sample-atomic-commerce-react#build", "@samples/atomic-search-commerce-angular#build"]',
  },
  ['@coveo/atomic#publint']
);
run(
  'supports multiple task names',
  {
    TASKS: 'test\npublint',
    PACKAGES: '@coveo/atomic',
    AFFECTED_TASKS: '["@coveo/atomic#publint","@coveo/atomic#test"]',
  },
  ['@coveo/atomic#publint', '@coveo/atomic#test']
);
run(
  'filters affected root generation tasks',
  {
    TASKS: 'generate:catalog-info\ngenerate:all',
    PACKAGES: '',
    AFFECTED_TASKS: '["//#generate:catalog-info"]',
  },
  ['//#generate:catalog-info']
);
run(
  'skips tasks for packages missing from the checkout',
  {
    TASKS: 'build\ngenerate:all',
    PACKAGES: '',
    AFFECTED_TASKS: '["//#generate:all", "@coveo/atomic#build", "@samples/does-not-exist#build"]',
  },
  ['//#generate:all', '@coveo/atomic#build'],
  ['@samples/does-not-exist#build']
);
run(
  'skips tasks missing from an existing package in the checkout',
  {
    TASKS: 'build\ngenerate:all',
    PACKAGES: '',
    AFFECTED_TASKS: '["@coveo/bueno#build", "@coveo/bueno#generate:all"]',
  },
  ['@coveo/bueno#build'],
  ['@coveo/bueno#generate:all']
);
run(
  'does not resolve an explicit empty affected list',
  {
    TASKS: 'build',
    PACKAGES: '@coveo/atomic',
    AFFECTED_TASKS: '[]',
  },
  []
);
for (const invalidAffectedTasks of ['null', '']) {
  runFailure(
    `rejects invalid affected tasks: ${invalidAffectedTasks}`,
    {
      GITHUB_WORKSPACE: resolve(directory, 'missing-workspace'),
      AFFECTED_TASKS: invalidAffectedTasks,
    },
    /AFFECTED_TASKS/
  );
}
console.log('All resolve-tasks scenarios passed.');
