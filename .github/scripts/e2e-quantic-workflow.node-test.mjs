import assert from 'node:assert/strict';
import fs from 'node:fs';
import {describe, it} from 'node:test';
import {parse} from 'yaml';

function readYaml(relativeUrl) {
  return parse(fs.readFileSync(new URL(relativeUrl, import.meta.url), 'utf8'));
}

function uses(steps, action) {
  return steps.some((step) => step.uses === action);
}

function stepNamed(steps, name) {
  return steps.find((step) => step.name === name);
}

function combinedRunScripts(steps) {
  return steps.map((step) => step.run ?? '').join('\n');
}

function cleanupConditionResult({cancelled, setup, playwright, apex}) {
  const results = [setup, playwright, apex];
  return (
    cancelled || results.includes('failure') || results.every((result) => result === 'success')
  );
}

describe('Quantic E2E workflow contract', () => {
  const workflow = readYaml('../workflows/e2e-quantic.yml');
  const setupAction = readYaml('../actions/e2e-quantic-setup/action.yml');
  const apexAction = readYaml('../actions/apex-unit-tests/action.yml');
  const playwrightAction = readYaml('../actions/playwright-quantic/action.yml');
  const linksAction = readYaml('../actions/post-scratch-org-links-on-pr/action.yml');

  it('locks required job names, dependencies, matrices, and report topology', () => {
    const setupJob = workflow.jobs['e2e-quantic-setup'];
    const apexJob = workflow.jobs['apex-quantic-tests'];
    const linksJob = workflow.jobs['post-scratch-org-links-to-pr'];
    const playwrightJob = workflow.jobs['e2e-quantic-playwright-test'];
    const mergeJob = workflow.jobs['merge-quantic-playwright-reports'];
    const cleanupJob = workflow.jobs['e2e-quantic-cleanup'];

    assert.equal(setupJob.name, 'Setup e2e tests on Quantic (LWS-${{ matrix.lws-status }})');
    assert.equal(apexJob.name, 'Run Quantic Apex unit tests');
    assert.equal(linksJob.name, 'Post Scratch Org Links to PR');
    assert.equal(playwrightJob.name, 'Run Playwright e2e tests on Quantic');
    assert.equal(mergeJob.name, 'Merge Playwright reports');
    assert.deepEqual(setupJob.strategy.matrix['lws-status'], ['enabled', 'disabled']);
    assert.deepEqual(playwrightJob.strategy.matrix, {
      shardIndex: [1, 2, 3, 4],
      shardTotal: [4],
    });
    assert.equal(apexJob.needs, 'e2e-quantic-setup');
    assert.equal(linksJob.needs, 'e2e-quantic-setup');
    assert.equal(playwrightJob.needs, 'e2e-quantic-setup');
    assert.deepEqual(mergeJob.needs, ['e2e-quantic-playwright-test']);
    assert.deepEqual(cleanupJob.needs, [
      'e2e-quantic-setup',
      'e2e-quantic-playwright-test',
      'apex-quantic-tests',
    ]);
    assert.equal(
      stepNamed(mergeJob.steps, 'Merge Playwright reports').with['artifact-pattern'],
      'quantic-blob-report-*'
    );
    assert.equal(
      stepNamed(mergeJob.steps, 'Merge Playwright reports').with['upload-artifact-name'],
      'quantic-playwright-report'
    );
  });

  it('publishes attempt-specific ownership on every setup outcome without changing env artifacts', () => {
    const setupJob = workflow.jobs['e2e-quantic-setup'];
    assert.equal(uses(setupJob.steps, './.github/actions/setup'), true);
    const uploads = setupAction.runs.steps.filter((step) =>
      step.uses?.startsWith('actions/upload-artifact@')
    );
    assert.equal(
      uploads.find(
        (step) => step.with.name === 'quantic-playwright-env-lws-${{ inputs.lws-status }}'
      ).with.path,
      'packages/quantic/.env'
    );
    const handoffUpload = uploads.find((step) =>
      step.with.name.startsWith(
        'quantic-scratch-org-repo-${{ github.repository_id }}-run-${{ github.run_id }}-attempt-'
      )
    );
    assert.equal(handoffUpload.if, 'always()');
    assert.equal(
      handoffUpload.with.name,
      'quantic-scratch-org-repo-${{ github.repository_id }}-run-${{ github.run_id }}-attempt-${{ github.run_attempt }}-lws-${{ inputs.lws-status }}'
    );
    assert.equal(
      handoffUpload.with.path,
      '${{ runner.temp }}/quantic-scratch-org-handoffs/quantic-scratch-org-repo-${{ github.repository_id }}-run-${{ github.run_id }}-attempt-${{ github.run_attempt }}-lws-${{ inputs.lws-status }}/scratch-org.json'
    );
  });

  it('authenticates the Dev Hub before Apex reconciliation and uses only its authoritative output', () => {
    const apexJob = workflow.jobs['apex-quantic-tests'];
    assert.equal(uses(apexJob.steps, './.github/actions/setup'), false);
    assert.equal(uses(apexJob.steps, './.github/actions/setup-sfdx'), true);
    const download = stepNamed(apexJob.steps, 'Download Apex scratch-org handoff');
    assert.equal(
      download.with.name,
      'quantic-scratch-org-repo-${{ github.repository_id }}-run-${{ github.run_id }}-attempt-${{ github.run_attempt }}-lws-enabled'
    );
    const devHubIndex = apexJob.steps.indexOf(
      stepNamed(apexJob.steps, 'Authenticate Apex reconciliation to the Salesforce Dev Hub')
    );
    const validationIndex = apexJob.steps.indexOf(
      stepNamed(apexJob.steps, 'Validate Apex scratch-org handoff')
    );
    assert.ok(devHubIndex < validationIndex);
    const validationScript = stepNamed(apexJob.steps, 'Validate Apex scratch-org handoff').run;
    assert.match(validationScript, /validate-ready/);
    assert.match(validationScript, /--producer-attempt "\$GITHUB_RUN_ATTEMPT"/);
    assert.match(validationScript, /GITHUB_REPOSITORY_ID/);
    assert.match(validationScript, /--dev-hub-username/);
    const scratchAuth = stepNamed(
      apexJob.steps,
      'Authenticate to authoritative Quantic scratch org'
    );
    assert.equal(scratchAuth.env.APEX_ORG_USERNAME, '${{ steps.apex-org.outputs.username }}');
    assert.match(scratchAuth.run, /--username "\$APEX_ORG_USERNAME"/);
    const apexActionStep = apexJob.steps.find(
      (step) => step.uses === './.github/actions/apex-unit-tests'
    );
    assert.equal(apexActionStep.with['target-org'], '${{ steps.apex-org.outputs.username }}');
    const apexRun = stepNamed(apexAction.runs.steps, 'Run Apex unit tests');
    assert.match(apexRun.run, /sf apex run test --target-org "\$INPUTS_TARGET_ORG"/);
    assert.equal(apexRun.env.INPUTS_TARGET_ORG, '${{ inputs.target-org }}');
  });

  it('runs cleanup for setup, Playwright, Apex, cancellation, and success outcomes', () => {
    const cleanupJob = workflow.jobs['e2e-quantic-cleanup'];
    assert.equal(cleanupJob.if, '${{ cancelled() || failure() || success() }}');
    const cases = [
      {cancelled: false, setup: 'failure', playwright: 'skipped', apex: 'skipped'},
      {cancelled: false, setup: 'success', playwright: 'failure', apex: 'success'},
      {cancelled: false, setup: 'success', playwright: 'success', apex: 'failure'},
      {cancelled: true, setup: 'success', playwright: 'cancelled', apex: 'cancelled'},
      {cancelled: false, setup: 'success', playwright: 'success', apex: 'success'},
    ];
    for (const topology of cases) {
      assert.equal(cleanupConditionResult(topology), true);
    }
  });

  it('reconciles all producer attempts after a best-effort artifact download', () => {
    const cleanupJob = workflow.jobs['e2e-quantic-cleanup'];
    assert.equal(uses(cleanupJob.steps, './.github/actions/setup'), false);
    assert.equal(uses(cleanupJob.steps, './.github/actions/setup-sfdx'), true);
    const download = stepNamed(cleanupJob.steps, 'Download scratch-org handoffs');
    assert.equal(download['continue-on-error'], true);
    assert.equal(
      download.with.pattern,
      'quantic-scratch-org-repo-${{ github.repository_id }}-run-${{ github.run_id }}-attempt-*-lws-*'
    );
    assert.equal(download.with.path, '${{ runner.temp }}/quantic-scratch-org-handoffs');
    const authIndex = cleanupJob.steps.indexOf(
      stepNamed(cleanupJob.steps, 'Authenticate cleanup to the Salesforce Dev Hub')
    );
    const reconcile = stepNamed(cleanupJob.steps, 'Reconcile cleanup scratch-org handoffs');
    assert.ok(authIndex < cleanupJob.steps.indexOf(reconcile));
    assert.equal(
      reconcile.if,
      "${{ always() && steps.cleanup-salesforce-auth.outcome == 'success' }}"
    );
    assert.equal(reconcile['continue-on-error'], undefined);
    assert.match(reconcile.run, /validate-cleanup/);
    assert.match(reconcile.run, /--targets-file/);
  });

  it('maps each LWS cleanup variant to its exact target set, credentials, and guard', () => {
    const cleanupSteps = workflow.jobs['e2e-quantic-cleanup'].steps;
    for (const [label, lwsStatus] of [
      ['LWS-enabled', 'enabled'],
      ['LWS-disabled', 'disabled'],
    ]) {
      const deletion = stepNamed(cleanupSteps, `Delete ${label} Quantic scratch org`);
      assert.equal(
        deletion.if,
        "${{ always() && steps.scratch-orgs.outcome == 'success' && steps.scratch-orgs.outputs." +
          `${lwsStatus}-target-count != '0' }}`
      );
      assert.match(deletion.run, /delete-cleanup/);
      assert.match(deletion.run, new RegExp(`--lws-status ${lwsStatus}`));
      assert.match(deletion.run, /--targets-file/);
      assert.equal(
        deletion.env.SFDX_AUTH_JWT_KEY_FILE,
        '${{ runner.temp }}/quantic-cleanup-jwt.key'
      );
      assert.equal(deletion.env.SFDX_AUTH_CLIENT_ID, '${{ secrets.SFDX_AUTH_CLIENT_ID }}');
    }
    assert.doesNotMatch(
      combinedRunScripts(cleanupSteps),
      /resolve-org-username|delete-org\.ts|sf org delete scratch/
    );
  });

  it('retains Apex, Playwright, PR-link, and merge artifact behavior', () => {
    assert.equal(
      apexAction.runs.steps.find((step) => step.uses?.startsWith('actions/upload-artifact@')).with
        .name,
      'quantic-apex-test-results'
    );
    assert.equal(
      playwrightAction.runs.steps.find((step) => step.uses?.startsWith('actions/upload-artifact@'))
        .with.name,
      'quantic-blob-report-${{ matrix.shardIndex }}'
    );
    const linkDownload = linksAction.runs.steps.find((step) =>
      step.uses?.startsWith('actions/download-artifact@')
    );
    assert.equal(linkDownload.with.pattern, 'quantic-playwright-env-*');
    assert.equal(linkDownload.with['merge-multiple'], true);
  });
});
