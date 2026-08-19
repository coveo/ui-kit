// Simple ad-hoc script to help development of resolve-tasks.mjs
import {execFileSync} from 'node:child_process';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const directory = dirname(fileURLToPath(import.meta.url));
const resolver = resolve(directory, 'resolve-tasks.mjs');
const workspace = resolve(directory, '../../..');
const run = (name, environment, expected) => {
  const actual = execFileSync(process.execPath, [resolver], {
    cwd: workspace,
    env: {...process.env, GITHUB_WORKSPACE: workspace, ...environment},
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();
  assert.equal(actual, expected.join('\n'), name);
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
    AFFECTED_TASKS: '["@coveo/atomic#test", "@coveo/atomic#publint"]',
  },
  ['@coveo/atomic#publint', '@coveo/atomic#test']
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
for (const invalidAffectedTasks of ['null', '{}', '["@coveo/atomic#build", 1]']) {
  runFailure(
    `rejects invalid affected tasks: ${invalidAffectedTasks}`,
    {
      GITHUB_WORKSPACE: resolve(directory, 'missing-workspace'),
      AFFECTED_TASKS: invalidAffectedTasks,
    },
    /AFFECTED_TASKS must be a JSON array of strings\./
  );
}
run(
  'resolves the selected workspace when affected tasks are not provided',
  {
    TASKS: 'publint',
    PACKAGES: '@coveo/atomic',
    AFFECTED_TASKS: '',
  },
  ['@coveo/atomic#publint']
);
console.log('All resolve-tasks scenarios passed.');
