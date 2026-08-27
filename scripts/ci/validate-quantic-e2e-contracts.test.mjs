import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {parse} from 'yaml';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFileSync(resolve(repositoryRoot, path), 'utf8');
const quanticPackage = JSON.parse(read('packages/quantic/package.json'));
const quanticTurbo = JSON.parse(read('packages/quantic/turbo.json'));
const ciWorkflow = parse(read('.github/workflows/ci.yml'));
const e2eWorkflow = parse(read('.github/workflows/e2e-quantic.yml'));
const e2eSetupAction = parse(read('.github/actions/e2e-quantic-setup/action.yml'));
const playwrightConfig = read('packages/quantic/playwright.config.ts');
const playwrightAction = parse(read('.github/actions/playwright-quantic/action.yml'));

const playwrightOutputs = ['playwright-report/**', 'blob-report/**', 'test-results/**'];

const expectedRootInputs = [
  '$TURBO_ROOT$/.github/actions/apex-unit-tests/**',
  '$TURBO_ROOT$/.github/actions/calculate-affected/**',
  '$TURBO_ROOT$/.github/actions/e2e-quantic-setup/**',
  '$TURBO_ROOT$/.github/actions/merge-playwright-reports/**',
  '$TURBO_ROOT$/.github/actions/playwright-quantic/**',
  '$TURBO_ROOT$/.github/actions/post-scratch-org-links-on-pr/**',
  '$TURBO_ROOT$/.github/actions/setup-sfdx/**',
  '$TURBO_ROOT$/.github/actions/setup/**',
  '$TURBO_ROOT$/.github/workflows/ci.yml',
  '$TURBO_ROOT$/.github/workflows/e2e-quantic.yml',
];

test('defines separate Quantic E2E task contracts', () => {
  assert.equal(quanticPackage.scripts.e2e, 'playwright test');
  assert.equal(quanticPackage.scripts['e2e:playwright'], 'playwright test');
  assert.equal(quanticPackage.scripts['e2e:prepare'], undefined);

  assert.deepEqual(quanticTurbo.tasks.e2e.dependsOn, ['e2e:prepare']);
  assert.deepEqual(quanticTurbo.tasks.e2e.outputs, playwrightOutputs);
  assert.equal(quanticTurbo.tasks.e2e.cache, false);
  assert.deepEqual(quanticTurbo.tasks['e2e:prepare'].dependsOn, [
    'build:staticresources',
    'validate:e2e-task-contracts',
  ]);
  assert.deepEqual(quanticTurbo.tasks['e2e:prepare'].outputs, []);
  assert.deepEqual(quanticTurbo.tasks['e2e:playwright'].dependsOn, [
    '@coveo/platform-mock-api#build',
  ]);
  assert.deepEqual(quanticTurbo.tasks['e2e:playwright'].inputs, ['$TURBO_DEFAULT$']);
  assert.deepEqual(quanticTurbo.tasks['e2e:playwright'].outputs, playwrightOutputs);
  assert.equal(quanticTurbo.tasks['e2e:playwright'].cache, false);
});

test('selects Quantic E2E for workflow and action changes', () => {
  assert.deepEqual(
    quanticTurbo.tasks.e2e.inputs.toSorted(),
    ['$TURBO_DEFAULT$', ...expectedRootInputs].toSorted()
  );
});

test('routes each Quantic E2E stage through its task contract', () => {
  const setupCommands = e2eWorkflow.jobs['e2e-quantic-setup'].steps
    .filter((step) => step.run)
    .map((step) => step.run);
  const playwrightCommands = playwrightAction.runs.steps
    .filter((step) => step.run)
    .map((step) => step.run);

  assert.deepEqual(setupCommands, ['pnpm exec turbo run @coveo/quantic#e2e:prepare']);
  assert.deepEqual(playwrightCommands, [
    'pnpm exec turbo run @coveo/quantic#e2e:playwright -- --shard=${INPUTS_SHARDINDEX}/${INPUTS_SHARDTOTAL}',
  ]);

  const ciJob = ciWorkflow.jobs['e2e-quantic'];
  const normalizeWhitespace = (value) => value.replace(/\s+/g, ' ').trim();
  const expectedCondition = `\${{
    always() &&
    !cancelled() &&
    needs.affected.result == 'success' &&
    (needs.build.result == 'success' || needs.build.result == 'skipped') &&
    contains(fromJSON(needs.affected.outputs.tasks), '@coveo/quantic#e2e') &&
    !(github.event_name == 'pull_request' && contains(github.event.pull_request.labels.*.name, 'skip-quantic'))
  }}`;

  assert.deepEqual(ciJob.needs, ['affected', 'build']);
  assert.equal(normalizeWhitespace(ciJob.if), normalizeWhitespace(expectedCondition));
  assert.equal(ciJob.uses, './.github/workflows/e2e-quantic.yml');
});

test('preserves Quantic E2E artifact handoffs', () => {
  const setupUpload = e2eSetupAction.runs.steps.find((step) =>
    step.uses?.startsWith('actions/upload-artifact@')
  );
  const playwrightDownload = playwrightAction.runs.steps.find((step) =>
    step.uses?.startsWith('actions/download-artifact@')
  );
  const playwrightUpload = playwrightAction.runs.steps.find((step) =>
    step.uses?.startsWith('actions/upload-artifact@')
  );
  const mergeReports = e2eWorkflow.jobs['merge-quantic-playwright-reports'].steps.find(
    (step) => step.uses === './.github/actions/merge-playwright-reports'
  );

  assert.deepEqual(setupUpload?.with, {
    name: 'quantic-playwright-env-lws-${{ inputs.lws-status }}',
    path: 'packages/quantic/.env',
    'include-hidden-files': true,
    'retention-days': 1,
    'if-no-files-found': 'error',
  });
  assert.deepEqual(playwrightDownload?.with, {
    pattern: 'quantic-playwright-env-*',
    path: 'packages/quantic/.env',
    'merge-multiple': true,
  });
  assert.deepEqual(playwrightUpload?.with, {
    name: 'quantic-blob-report-${{ matrix.shardIndex }}',
    path: 'packages/quantic/blob-report',
    'retention-days': 5,
  });
  assert.deepEqual(mergeReports?.with, {
    'working-directory': 'packages/quantic',
    'artifact-pattern': 'quantic-blob-report-*',
    'upload-artifact-name': 'quantic-playwright-report',
  });
});

test('preserves the Quantic E2E topology', () => {
  const jobs = e2eWorkflow.jobs;

  assert.deepEqual(jobs['e2e-quantic-setup'].strategy.matrix['lws-status'], [
    'enabled',
    'disabled',
  ]);
  assert.deepEqual(jobs['e2e-quantic-playwright-test'].strategy.matrix.shardIndex, [1, 2, 3, 4]);
  assert.deepEqual(jobs['e2e-quantic-playwright-test'].strategy.matrix.shardTotal, [4]);
  assert.equal(jobs['apex-quantic-tests'].needs, 'e2e-quantic-setup');
  assert.equal(jobs['post-scratch-org-links-to-pr'].needs, 'e2e-quantic-setup');
  assert.equal(jobs['e2e-quantic-playwright-test'].needs, 'e2e-quantic-setup');
  assert.deepEqual(jobs['merge-quantic-playwright-reports'].needs, ['e2e-quantic-playwright-test']);
  assert.deepEqual(jobs['e2e-quantic-cleanup'].needs, [
    'e2e-quantic-playwright-test',
    'apex-quantic-tests',
  ]);

  assert.match(playwrightConfig, /name: 'LWS-enabled'/);
  assert.match(playwrightConfig, /name: 'LWS-disabled'/);
});
