import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, it} from 'node:test';
import {
  ARTIFACT_ROOT_NAME,
  buildTrustedCiIdentity,
  CLEANUP_TARGETS_FILE_NAME,
  HANDOFF_FILE_NAME,
  serializeManifest,
  validateArtifactDirectory,
} from './quantic-scratch-org-handoff.mjs';
import {
  createFakeSalesforce,
  readFakeSalesforceCalls,
} from './fake-salesforce.node-test-helper.mjs';

const CLI = new URL('./quantic-scratch-org-handoff.mjs', import.meta.url).pathname;
const DEV_HUB_USERNAME = 'dev-hub@example.invalid';
const CONTEXT = {
  runId: '123456789',
  runAttempt: 2,
  repository: 'coveo/ui-kit',
  repositoryId: '987654321',
  commitSha: 'a'.repeat(40),
};
const temporaryDirectories = [];

function temporaryDirectory() {
  const directory = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'quantic-handoff-'));
  temporaryDirectories.push(directory);
  return directory;
}

function identity(trustedRoot, lwsStatus, producerAttempt) {
  return buildTrustedCiIdentity(CONTEXT, lwsStatus, producerAttempt, trustedRoot);
}

function identityIndex(producerAttempt, lwsStatus) {
  return (producerAttempt - 1) * 2 + (lwsStatus === 'enabled' ? 1 : 2);
}

function orgId(producerAttempt, lwsStatus) {
  return `00D00000000000${identityIndex(producerAttempt, lwsStatus)}AAA`;
}

function scratchOrgInfoId(producerAttempt, lwsStatus) {
  return `2SR00000000000${identityIndex(producerAttempt, lwsStatus)}AAA`;
}

function username(producerAttempt, lwsStatus) {
  return `scratch-${producerAttempt}-${lwsStatus}@example.invalid`;
}

function orgName(producerAttempt, lwsStatus, context = CONTEXT) {
  return buildTrustedCiIdentity(context, lwsStatus, producerAttempt, fs.realpathSync(os.tmpdir()))
    .orgName;
}

function alias(producerAttempt, lwsStatus, context = CONTEXT) {
  return orgName(producerAttempt, lwsStatus, context).replace(/-/g, '_');
}

function manifest(lwsStatus, producerAttempt, overrides = {}) {
  return {
    schemaVersion: 3,
    runId: CONTEXT.runId,
    runAttempt: producerAttempt,
    repository: CONTEXT.repository,
    repositoryId: CONTEXT.repositoryId,
    commitSha: CONTEXT.commitSha,
    lwsStatus,
    alias: alias(producerAttempt, lwsStatus),
    username: username(producerAttempt, lwsStatus),
    orgId: orgId(producerAttempt, lwsStatus),
    phase: 'ready',
    communityUrl: `https://${producerAttempt}-${lwsStatus}.example.invalid/examples`,
    ...overrides,
  };
}

function record(lwsStatus, producerAttempt, overrides = {}) {
  return {
    Id: scratchOrgInfoId(producerAttempt, lwsStatus),
    ScratchOrg: orgId(producerAttempt, lwsStatus),
    SignupUsername: username(producerAttempt, lwsStatus),
    OrgName: orgName(producerAttempt, lwsStatus),
    Status: 'Active',
    ...overrides,
  };
}

function provisioningRecord(lwsStatus, producerAttempt, status) {
  return record(lwsStatus, producerAttempt, {
    ScratchOrg: null,
    SignupUsername: null,
    Status: status,
  });
}

function writeArtifact(trustedRoot, lwsStatus, producerAttempt, value) {
  const artifactIdentity = identity(trustedRoot, lwsStatus, producerAttempt);
  fs.mkdirSync(artifactIdentity.artifactDirectory, {recursive: true});
  fs.writeFileSync(artifactIdentity.handoffFile, serializeManifest(value), 'utf8');
  return artifactIdentity;
}

function workflowEnvironment(fakeSalesforce, overrides = {}) {
  return {
    ...process.env,
    GITHUB_RUN_ID: CONTEXT.runId,
    GITHUB_RUN_ATTEMPT: String(CONTEXT.runAttempt),
    GITHUB_REPOSITORY: CONTEXT.repository,
    GITHUB_REPOSITORY_ID: CONTEXT.repositoryId,
    GITHUB_SHA: CONTEXT.commitSha,
    QUANTIC_SCRATCH_ORG_MAX_POLL_ATTEMPTS: '3',
    QUANTIC_SCRATCH_ORG_POLL_INTERVAL_MS: '0',
    QUANTIC_SF_EXECUTABLE: fakeSalesforce,
    ...overrides,
  };
}

function runCli(args, fakeSalesforce, environment = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    encoding: 'utf8',
    env: workflowEnvironment(fakeSalesforce, environment),
  });
}

function parseOutputs(outputFile) {
  return Object.fromEntries(
    fs
      .readFileSync(outputFile, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1)];
      })
  );
}

function queryConfig(records) {
  return {
    queries: Object.fromEntries(records.map((value) => [value.OrgName, [value]])),
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

describe('validate-ready workflow CLI', () => {
  it('emits only the exact authoritative current-attempt identity', () => {
    const trustedRoot = temporaryDirectory();
    const expectedManifest = manifest('enabled', 2);
    const artifactIdentity = writeArtifact(trustedRoot, 'enabled', 2, expectedManifest);
    const fake = createFakeSalesforce(temporaryDirectory(), queryConfig([record('enabled', 2)]));
    const outputFile = path.join(trustedRoot, 'github-output');
    fs.writeFileSync(outputFile, '');

    const result = runCli(
      [
        'validate-ready',
        '--artifact-directory',
        artifactIdentity.artifactDirectory,
        '--trusted-root',
        trustedRoot,
        '--lws-status',
        'enabled',
        '--producer-attempt',
        '2',
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--github-output',
        outputFile,
      ],
      fake.executable
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(parseOutputs(outputFile), {
      username: username(2, 'enabled'),
      'org-id': orgId(2, 'enabled'),
      'scratch-org-info-id': scratchOrgInfoId(2, 'enabled'),
      alias: alias(2, 'enabled'),
      'community-url': expectedManifest.communityUrl,
      'lws-status': 'enabled',
      'producer-attempt': '2',
      'org-name': orgName(2, 'enabled'),
    });
  });

  it('rejects canonical artifacts with a different username or immutable org ID', () => {
    for (const overrides of [
      {username: 'another-active-org@example.invalid'},
      {orgId: '00D000000000009AAA'},
    ]) {
      const trustedRoot = temporaryDirectory();
      const artifactIdentity = writeArtifact(
        trustedRoot,
        'enabled',
        2,
        manifest('enabled', 2, overrides)
      );
      const fake = createFakeSalesforce(temporaryDirectory(), queryConfig([record('enabled', 2)]));
      const outputFile = path.join(trustedRoot, 'github-output');
      fs.writeFileSync(outputFile, '');

      const result = runCli(
        [
          'validate-ready',
          '--artifact-directory',
          artifactIdentity.artifactDirectory,
          '--trusted-root',
          trustedRoot,
          '--lws-status',
          'enabled',
          '--producer-attempt',
          '2',
          '--dev-hub-username',
          DEV_HUB_USERNAME,
          '--github-output',
          outputFile,
        ],
        fake.executable
      );

      assert.notEqual(result.status, 0);
      assert.equal(fs.readFileSync(outputFile, 'utf8'), '');
    }
  });

  it('fails closed on multiple exact active server records without partial outputs', () => {
    const trustedRoot = temporaryDirectory();
    const artifactIdentity = writeArtifact(trustedRoot, 'enabled', 2, manifest('enabled', 2));
    const serverRecord = record('enabled', 2);
    const fake = createFakeSalesforce(temporaryDirectory(), {
      queries: {
        [serverRecord.OrgName]: [
          serverRecord,
          {
            ...serverRecord,
            Id: '2SR000000000009AAA',
            ScratchOrg: '00D000000000009AAA',
            SignupUsername: 'duplicate@example.invalid',
          },
        ],
      },
    });
    const outputFile = path.join(trustedRoot, 'github-output');
    fs.writeFileSync(outputFile, '');

    const result = runCli(
      [
        'validate-ready',
        '--artifact-directory',
        artifactIdentity.artifactDirectory,
        '--trusted-root',
        trustedRoot,
        '--lws-status',
        'enabled',
        '--producer-attempt',
        '2',
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--github-output',
        outputFile,
      ],
      fake.executable
    );

    assert.notEqual(result.status, 0);
    assert.equal(fs.readFileSync(outputFile, 'utf8'), '');
  });

  it('fails closed when a subset rerun has no current-producer artifact', () => {
    const trustedRoot = temporaryDirectory();
    const artifactIdentity = writeArtifact(trustedRoot, 'enabled', 1, manifest('enabled', 1));
    const fake = createFakeSalesforce(temporaryDirectory(), queryConfig([record('enabled', 1)]));
    const outputFile = path.join(trustedRoot, 'github-output');
    fs.writeFileSync(outputFile, '');

    const result = runCli(
      [
        'validate-ready',
        '--artifact-directory',
        artifactIdentity.artifactDirectory,
        '--trusted-root',
        trustedRoot,
        '--lws-status',
        'enabled',
        '--producer-attempt',
        '1',
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--github-output',
        outputFile,
      ],
      fake.executable
    );

    assert.notEqual(result.status, 0);
    assert.equal(fs.readFileSync(outputFile, 'utf8'), '');
  });
});

describe('validate-cleanup workflow CLI', () => {
  it('polls no-artifact cancellation states to Active and deletes only repository-qualified identities', () => {
    const trustedRoot = temporaryDirectory();
    const enabledRecord = record('enabled', 2);
    const disabledRecord = record('disabled', 2);
    const foreignContext = {...CONTEXT, repositoryId: '11111111'};
    const foreignName = orgName(2, 'enabled', foreignContext);
    assert.notEqual(foreignName, enabledRecord.OrgName);
    const fake = createFakeSalesforce(temporaryDirectory(), {
      queries: {
        [foreignName]: [
          {...enabledRecord, OrgName: foreignName, SignupUsername: 'foreign@example.invalid'},
        ],
      },
      querySequences: {
        [enabledRecord.OrgName]: [
          [],
          [provisioningRecord('enabled', 2, 'New')],
          [enabledRecord],
          [enabledRecord],
        ],
        [disabledRecord.OrgName]: [
          [provisioningRecord('disabled', 2, 'Creating')],
          [disabledRecord],
          [disabledRecord],
        ],
      },
    });
    const outputFile = path.join(trustedRoot, 'github-output');
    const targetsFile = path.join(trustedRoot, CLEANUP_TARGETS_FILE_NAME);
    const keyFile = path.join(trustedRoot, 'server.key');
    fs.writeFileSync(outputFile, '');
    fs.writeFileSync(keyFile, 'placeholder', {mode: 0o600});

    const validateResult = runCli(
      [
        'validate-cleanup',
        '--artifact-root',
        path.join(trustedRoot, ARTIFACT_ROOT_NAME),
        '--trusted-root',
        trustedRoot,
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--targets-file',
        targetsFile,
        '--github-output',
        outputFile,
      ],
      fake.executable
    );
    assert.equal(validateResult.status, 0, validateResult.stderr);
    assert.deepEqual(parseOutputs(outputFile), {
      'target-count': '2',
      'enabled-target-count': '1',
      'disabled-target-count': '1',
      'enabled-producer-attempts': '2',
      'disabled-producer-attempts': '2',
    });

    for (const lwsStatus of ['enabled', 'disabled']) {
      const deleteResult = runCli(
        [
          'delete-cleanup',
          '--targets-file',
          targetsFile,
          '--trusted-root',
          trustedRoot,
          '--lws-status',
          lwsStatus,
          '--dev-hub-username',
          DEV_HUB_USERNAME,
        ],
        fake.executable,
        {
          SFDX_AUTH_CLIENT_ID: 'client-id',
          SFDX_AUTH_JWT_KEY_FILE: keyFile,
        }
      );
      assert.equal(deleteResult.status, 0, deleteResult.stderr);
    }

    const calls = readFakeSalesforceCalls(fake.callsFile);
    const queries = calls.filter(([first, second]) => first === 'data' && second === 'query');
    const expectedNames = new Set(
      [1, 2].flatMap((producerAttempt) =>
        ['enabled', 'disabled'].map((lwsStatus) => orgName(producerAttempt, lwsStatus))
      )
    );
    for (const args of queries) {
      const query = args[args.indexOf('--query') + 1];
      assert.doesNotMatch(query, /LIKE|Status\s*=|quantic-/);
      const match = query.match(/WHERE OrgName = '([^']+)'$/);
      assert.ok(match && expectedNames.has(match[1]));
      assert.notEqual(match[1], foreignName);
    }
    for (const activeRecord of [enabledRecord, disabledRecord]) {
      assert.equal(
        calls.some(
          (args) =>
            args[0] === 'org' &&
            args[1] === 'delete' &&
            args[args.indexOf('--target-org') + 1] === activeRecord.SignupUsername
        ),
        true
      );
    }
    assert.equal(
      calls.some((args) => args.includes('foreign@example.invalid')),
      false
    );
  });

  it('fails loudly when a submitted org remains in a provisioning state', () => {
    const trustedRoot = temporaryDirectory();
    const creating = provisioningRecord('enabled', 2, 'Creating');
    const fake = createFakeSalesforce(temporaryDirectory(), {
      queries: {[creating.OrgName]: [creating]},
    });
    const outputFile = path.join(trustedRoot, 'github-output');
    const targetsFile = path.join(trustedRoot, CLEANUP_TARGETS_FILE_NAME);
    fs.writeFileSync(outputFile, '');

    const result = runCli(
      [
        'validate-cleanup',
        '--artifact-root',
        path.join(trustedRoot, ARTIFACT_ROOT_NAME),
        '--trusted-root',
        trustedRoot,
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--targets-file',
        targetsFile,
        '--github-output',
        outputFile,
      ],
      fake.executable,
      {QUANTIC_SCRATCH_ORG_MAX_POLL_ATTEMPTS: '3'}
    );

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /timed out/);
    assert.equal(fs.readFileSync(outputFile, 'utf8'), '');
    assert.equal(fs.existsSync(targetsFile), false);
  });

  it('recovers an exact active org when every handoff artifact is missing', () => {
    const trustedRoot = temporaryDirectory();
    const fake = createFakeSalesforce(temporaryDirectory(), queryConfig([record('enabled', 2)]));
    const outputFile = path.join(trustedRoot, 'github-output');
    const targetsFile = path.join(trustedRoot, CLEANUP_TARGETS_FILE_NAME);
    fs.writeFileSync(outputFile, '');

    const result = runCli(
      [
        'validate-cleanup',
        '--artifact-root',
        path.join(trustedRoot, ARTIFACT_ROOT_NAME),
        '--trusted-root',
        trustedRoot,
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--targets-file',
        targetsFile,
        '--github-output',
        outputFile,
      ],
      fake.executable
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(parseOutputs(outputFile), {
      'target-count': '1',
      'enabled-target-count': '1',
      'disabled-target-count': '0',
      'enabled-producer-attempts': '2',
      'disabled-producer-attempts': '',
    });
  });

  it('treats a deleted handoff with no active server record as idempotently complete', () => {
    const trustedRoot = temporaryDirectory();
    writeArtifact(
      trustedRoot,
      'disabled',
      1,
      manifest('disabled', 1, {phase: 'deleted', communityUrl: null})
    );
    const fake = createFakeSalesforce(temporaryDirectory());
    const outputFile = path.join(trustedRoot, 'github-output');
    const targetsFile = path.join(trustedRoot, CLEANUP_TARGETS_FILE_NAME);
    fs.writeFileSync(outputFile, '');

    const result = runCli(
      [
        'validate-cleanup',
        '--artifact-root',
        path.join(trustedRoot, ARTIFACT_ROOT_NAME),
        '--trusted-root',
        trustedRoot,
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--targets-file',
        targetsFile,
        '--github-output',
        outputFile,
      ],
      fake.executable
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(parseOutputs(outputFile), {
      'target-count': '0',
      'enabled-target-count': '0',
      'disabled-target-count': '0',
      'enabled-producer-attempts': '',
      'disabled-producer-attempts': '',
    });
    assert.deepEqual(JSON.parse(fs.readFileSync(targetsFile, 'utf8')).targets, []);
  });

  it('rejects a symlinked cleanup targets destination without overwriting it', () => {
    const trustedRoot = temporaryDirectory();
    const fake = createFakeSalesforce(temporaryDirectory());
    const outputFile = path.join(trustedRoot, 'github-output');
    const targetsFile = path.join(trustedRoot, CLEANUP_TARGETS_FILE_NAME);
    const outsideFile = path.join(temporaryDirectory(), 'outside-targets.json');
    fs.writeFileSync(outputFile, '');
    fs.writeFileSync(outsideFile, 'unchanged');
    fs.symlinkSync(outsideFile, targetsFile);

    const result = runCli(
      [
        'validate-cleanup',
        '--artifact-root',
        path.join(trustedRoot, ARTIFACT_ROOT_NAME),
        '--trusted-root',
        trustedRoot,
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--targets-file',
        targetsFile,
        '--github-output',
        outputFile,
      ],
      fake.executable
    );

    assert.notEqual(result.status, 0);
    assert.equal(fs.readFileSync(outputFile, 'utf8'), '');
    assert.equal(fs.readFileSync(outsideFile, 'utf8'), 'unchanged');
    assert.equal(fs.lstatSync(targetsFile).isSymbolicLink(), true);
  });

  it('targets and deletes both active attempt-1 variants on an artifact-less attempt 2', () => {
    const trustedRoot = temporaryDirectory();
    const fake = createFakeSalesforce(
      temporaryDirectory(),
      queryConfig([record('enabled', 1), record('disabled', 1)])
    );
    const outputFile = path.join(trustedRoot, 'github-output');
    const targetsFile = path.join(trustedRoot, CLEANUP_TARGETS_FILE_NAME);
    const keyFile = path.join(trustedRoot, 'server.key');
    fs.writeFileSync(outputFile, '');
    fs.writeFileSync(keyFile, 'placeholder', {mode: 0o600});

    const result = runCli(
      [
        'validate-cleanup',
        '--artifact-root',
        path.join(trustedRoot, ARTIFACT_ROOT_NAME),
        '--trusted-root',
        trustedRoot,
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--targets-file',
        targetsFile,
        '--github-output',
        outputFile,
      ],
      fake.executable
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(parseOutputs(outputFile), {
      'target-count': '2',
      'enabled-target-count': '1',
      'disabled-target-count': '1',
      'enabled-producer-attempts': '1',
      'disabled-producer-attempts': '1',
    });
    assert.equal(fs.statSync(targetsFile).mode & 0o777, 0o600);
    assert.deepEqual(
      JSON.parse(fs.readFileSync(targetsFile, 'utf8')).targets.map(
        ({producerAttempt, lwsStatus, username: targetUsername}) => ({
          producerAttempt,
          lwsStatus,
          username: targetUsername,
        })
      ),
      [
        {
          producerAttempt: 1,
          lwsStatus: 'enabled',
          username: username(1, 'enabled'),
        },
        {
          producerAttempt: 1,
          lwsStatus: 'disabled',
          username: username(1, 'disabled'),
        },
      ]
    );
    const queries = readFakeSalesforceCalls(fake.callsFile).filter(
      ([first, second]) => first === 'data' && second === 'query'
    );
    const queriedNames = new Set();
    for (const args of queries) {
      const query = args[args.indexOf('--query') + 1];
      assert.doesNotMatch(query, /LIKE|Status\s*=/);
      const match = query.match(/WHERE OrgName = '([^']+)'$/);
      assert.ok(match);
      queriedNames.add(match[1]);
    }
    for (const producerAttempt of [1, 2]) {
      for (const lwsStatus of ['enabled', 'disabled']) {
        assert.equal(queriedNames.has(orgName(producerAttempt, lwsStatus)), true);
      }
    }
    for (const lwsStatus of ['enabled', 'disabled']) {
      const deleteResult = runCli(
        [
          'delete-cleanup',
          '--targets-file',
          targetsFile,
          '--trusted-root',
          trustedRoot,
          '--lws-status',
          lwsStatus,
          '--dev-hub-username',
          DEV_HUB_USERNAME,
        ],
        fake.executable,
        {
          SFDX_AUTH_CLIENT_ID: 'client-id',
          SFDX_AUTH_JWT_KEY_FILE: keyFile,
        }
      );
      assert.equal(deleteResult.status, 0, deleteResult.stderr);
    }
    const calls = readFakeSalesforceCalls(fake.callsFile);
    for (const lwsStatus of ['enabled', 'disabled']) {
      assert.equal(
        calls.some(
          (args) =>
            args[0] === 'org' &&
            args[1] === 'delete' &&
            args[args.indexOf('--target-org') + 1] === username(1, lwsStatus)
        ),
        true
      );
    }
  });

  it('recovers missing artifacts and handles partial and deleted handoffs', () => {
    const trustedRoot = temporaryDirectory();
    writeArtifact(
      trustedRoot,
      'enabled',
      1,
      manifest('enabled', 1, {phase: 'provisioned', communityUrl: null})
    );
    writeArtifact(
      trustedRoot,
      'disabled',
      1,
      manifest('disabled', 1, {phase: 'deleted', communityUrl: null})
    );
    const fake = createFakeSalesforce(
      temporaryDirectory(),
      queryConfig([record('enabled', 1), record('disabled', 2)])
    );
    const outputFile = path.join(trustedRoot, 'github-output');
    const targetsFile = path.join(trustedRoot, CLEANUP_TARGETS_FILE_NAME);
    fs.writeFileSync(outputFile, '');

    const result = runCli(
      [
        'validate-cleanup',
        '--artifact-root',
        path.join(trustedRoot, ARTIFACT_ROOT_NAME),
        '--trusted-root',
        trustedRoot,
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--targets-file',
        targetsFile,
        '--github-output',
        outputFile,
      ],
      fake.executable
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(parseOutputs(outputFile), {
      'target-count': '2',
      'enabled-target-count': '1',
      'disabled-target-count': '1',
      'enabled-producer-attempts': '1',
      'disabled-producer-attempts': '2',
    });
  });

  it('reconciles and deletes every exact LWS target across all attempts', () => {
    const trustedRoot = temporaryDirectory();
    const allRecords = [];
    for (const producerAttempt of [1, 2]) {
      for (const lwsStatus of ['enabled', 'disabled']) {
        writeArtifact(
          trustedRoot,
          lwsStatus,
          producerAttempt,
          manifest(lwsStatus, producerAttempt)
        );
        allRecords.push(record(lwsStatus, producerAttempt));
      }
    }
    const fake = createFakeSalesforce(temporaryDirectory(), queryConfig(allRecords));
    const outputFile = path.join(trustedRoot, 'github-output');
    const targetsFile = path.join(trustedRoot, CLEANUP_TARGETS_FILE_NAME);
    const keyFile = path.join(trustedRoot, 'server.key');
    fs.writeFileSync(outputFile, '');
    fs.writeFileSync(keyFile, 'placeholder', {mode: 0o600});

    const validateResult = runCli(
      [
        'validate-cleanup',
        '--artifact-root',
        path.join(trustedRoot, ARTIFACT_ROOT_NAME),
        '--trusted-root',
        trustedRoot,
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--targets-file',
        targetsFile,
        '--github-output',
        outputFile,
      ],
      fake.executable
    );
    assert.equal(validateResult.status, 0, validateResult.stderr);
    assert.deepEqual(parseOutputs(outputFile), {
      'target-count': '4',
      'enabled-target-count': '2',
      'disabled-target-count': '2',
      'enabled-producer-attempts': '1,2',
      'disabled-producer-attempts': '1,2',
    });

    for (const lwsStatus of ['enabled', 'disabled']) {
      const deleteResult = runCli(
        [
          'delete-cleanup',
          '--targets-file',
          targetsFile,
          '--trusted-root',
          trustedRoot,
          '--lws-status',
          lwsStatus,
          '--dev-hub-username',
          DEV_HUB_USERNAME,
        ],
        fake.executable,
        {
          SFDX_AUTH_CLIENT_ID: 'client-id',
          SFDX_AUTH_JWT_KEY_FILE: keyFile,
        }
      );
      assert.equal(deleteResult.status, 0, deleteResult.stderr);
    }

    const calls = readFakeSalesforceCalls(fake.callsFile);
    for (const value of allRecords) {
      assert.equal(
        calls.some(
          (args) => args[0] === 'org' && args[1] === 'login' && args.includes(value.SignupUsername)
        ),
        true
      );
      assert.equal(
        calls.some(
          (args) =>
            args[0] === 'org' &&
            args[1] === 'delete' &&
            args[args.indexOf('--target-org') + 1] === value.SignupUsername
        ),
        true
      );
    }
  });

  it('blocks login and deletion when authoritative IDs change after validation', () => {
    for (const changedFields of [{ScratchOrg: '00D000000000009AAA'}, {Id: '2SR000000000009AAA'}]) {
      const trustedRoot = temporaryDirectory();
      const initialRecord = record('enabled', 2);
      const fake = createFakeSalesforce(temporaryDirectory(), {
        querySequences: {
          [initialRecord.OrgName]: [[initialRecord], [{...initialRecord, ...changedFields}]],
        },
      });
      const outputFile = path.join(trustedRoot, 'github-output');
      const targetsFile = path.join(trustedRoot, CLEANUP_TARGETS_FILE_NAME);
      const keyFile = path.join(trustedRoot, 'server.key');
      fs.writeFileSync(outputFile, '');
      fs.writeFileSync(keyFile, 'placeholder', {mode: 0o600});

      const validateResult = runCli(
        [
          'validate-cleanup',
          '--artifact-root',
          path.join(trustedRoot, ARTIFACT_ROOT_NAME),
          '--trusted-root',
          trustedRoot,
          '--dev-hub-username',
          DEV_HUB_USERNAME,
          '--targets-file',
          targetsFile,
          '--github-output',
          outputFile,
        ],
        fake.executable
      );
      assert.equal(validateResult.status, 0, validateResult.stderr);

      const deleteResult = runCli(
        [
          'delete-cleanup',
          '--targets-file',
          targetsFile,
          '--trusted-root',
          trustedRoot,
          '--lws-status',
          'enabled',
          '--dev-hub-username',
          DEV_HUB_USERNAME,
        ],
        fake.executable,
        {
          SFDX_AUTH_CLIENT_ID: 'client-id',
          SFDX_AUTH_JWT_KEY_FILE: keyFile,
        }
      );
      assert.notEqual(deleteResult.status, 0);
      const calls = readFakeSalesforceCalls(fake.callsFile);
      assert.equal(
        calls.some(
          ([first, second]) => first === 'org' && (second === 'login' || second === 'delete')
        ),
        false
      );
    }
  });

  it('writes no outputs or targets when equal usernames have mismatched org IDs', () => {
    const trustedRoot = temporaryDirectory();
    writeArtifact(trustedRoot, 'enabled', 1, manifest('enabled', 1, {orgId: '00D000000000009AAA'}));
    const fake = createFakeSalesforce(temporaryDirectory(), queryConfig([record('enabled', 1)]));
    const outputFile = path.join(trustedRoot, 'github-output');
    const targetsFile = path.join(trustedRoot, CLEANUP_TARGETS_FILE_NAME);
    fs.writeFileSync(outputFile, '');

    const result = runCli(
      [
        'validate-cleanup',
        '--artifact-root',
        path.join(trustedRoot, ARTIFACT_ROOT_NAME),
        '--trusted-root',
        trustedRoot,
        '--dev-hub-username',
        DEV_HUB_USERNAME,
        '--targets-file',
        targetsFile,
        '--github-output',
        outputFile,
      ],
      fake.executable
    );

    assert.notEqual(result.status, 0);
    assert.equal(fs.readFileSync(outputFile, 'utf8'), '');
    assert.equal(fs.existsSync(targetsFile), false);
  });
});

describe('artifact trust boundaries', () => {
  it('rejects malformed JSON without reflecting artifact content', () => {
    const trustedRoot = temporaryDirectory();
    const artifactIdentity = writeArtifact(trustedRoot, 'enabled', 2, manifest('enabled', 2));
    fs.writeFileSync(artifactIdentity.handoffFile, '{untrusted-content');

    assert.throws(
      () =>
        validateArtifactDirectory(
          artifactIdentity.artifactDirectory,
          trustedRoot,
          CONTEXT,
          'enabled',
          2
        ),
      (error) => {
        assert.match(error.message, /not valid JSON/);
        assert.doesNotMatch(error.message, /untrusted-content/);
        return true;
      }
    );
  });

  it('rejects stale run, attempt, repository identity, SHA, LWS, and alias values', () => {
    const cases = [
      {runId: '987654321'},
      {runAttempt: 1},
      {repository: 'other/repository'},
      {repositoryId: '11111111'},
      {commitSha: 'b'.repeat(40)},
      {lwsStatus: 'disabled'},
      {alias: alias(2, 'disabled')},
    ];
    for (const overrides of cases) {
      const trustedRoot = temporaryDirectory();
      const artifactIdentity = writeArtifact(
        trustedRoot,
        'enabled',
        2,
        manifest('enabled', 2, overrides)
      );
      assert.throws(() =>
        validateArtifactDirectory(
          artifactIdentity.artifactDirectory,
          trustedRoot,
          CONTEXT,
          'enabled',
          2
        )
      );
    }
  });

  it('rejects traversal, oversized files, and symlinked roots, directories, and ancestors', () => {
    const traversalRoot = temporaryDirectory();
    const traversalIdentity = writeArtifact(traversalRoot, 'enabled', 2, manifest('enabled', 2));
    assert.throws(() =>
      validateArtifactDirectory(
        `${traversalIdentity.artifactDirectory}${path.sep}..${path.sep}${traversalIdentity.artifactName}`,
        traversalRoot,
        CONTEXT,
        'enabled',
        2
      )
    );

    const oversizedRoot = temporaryDirectory();
    const oversizedIdentity = writeArtifact(oversizedRoot, 'enabled', 2, manifest('enabled', 2));
    fs.writeFileSync(oversizedIdentity.handoffFile, 'x'.repeat(17 * 1024));
    assert.throws(
      () =>
        validateArtifactDirectory(
          oversizedIdentity.artifactDirectory,
          oversizedRoot,
          CONTEXT,
          'enabled',
          2
        ),
      /oversized/
    );

    const realRoot = temporaryDirectory();
    writeArtifact(realRoot, 'enabled', 2, manifest('enabled', 2));
    const symlinkParent = temporaryDirectory();
    const symlinkRoot = path.join(symlinkParent, 'root-link');
    fs.symlinkSync(realRoot, symlinkRoot);
    assert.throws(() =>
      validateArtifactDirectory(
        identity(symlinkRoot, 'enabled', 2).artifactDirectory,
        symlinkRoot,
        CONTEXT,
        'enabled',
        2
      )
    );

    const ancestorRoot = temporaryDirectory();
    const ancestorIdentity = identity(ancestorRoot, 'enabled', 2);
    fs.symlinkSync(temporaryDirectory(), ancestorIdentity.artifactRoot);
    assert.throws(() =>
      validateArtifactDirectory(
        ancestorIdentity.artifactDirectory,
        ancestorRoot,
        CONTEXT,
        'enabled',
        2
      )
    );

    const directoryRoot = temporaryDirectory();
    const directoryIdentity = identity(directoryRoot, 'enabled', 2);
    fs.mkdirSync(directoryIdentity.artifactRoot);
    fs.symlinkSync(temporaryDirectory(), directoryIdentity.artifactDirectory);
    assert.throws(() =>
      validateArtifactDirectory(
        directoryIdentity.artifactDirectory,
        directoryRoot,
        CONTEXT,
        'enabled',
        2
      )
    );
  });
});
