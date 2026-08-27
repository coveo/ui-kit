import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, it} from 'node:test';
import {
  createScratchOrg,
  deleteScratchOrg,
  loginScratchOrgJwt,
  queryScratchOrgsByName,
} from './salesforce-scratch-org.mjs';
import {
  createFakeSalesforce,
  readFakeSalesforceCalls,
} from './fake-salesforce.node-test-helper.mjs';

const temporaryDirectories = [];

function temporaryDirectory() {
  const directory = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'quantic-fake-sf-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

describe('Salesforce scratch-org adapter', () => {
  it('creates through fixed arguments and returns only immutable identity fields', () => {
    const directory = temporaryDirectory();
    const fake = createFakeSalesforce(directory);

    const result = createScratchOrg(
      {
        alias: 'q_rgc0uy9_w21i3v9_a2_e',
        definitionFile: '/workspace/scratch-def.json',
        durationDays: 1,
      },
      {sfExecutable: fake.executable}
    );

    assert.deepEqual(result, {
      orgId: '00D000000000001AAA',
      username: 'created@example.invalid',
    });
    assert.deepEqual(readFakeSalesforceCalls(fake.callsFile), [
      [
        'org',
        'create',
        'scratch',
        '--set-default',
        '--definition-file',
        '/workspace/scratch-def.json',
        '--alias',
        'q_rgc0uy9_w21i3v9_a2_e',
        '--duration-days',
        '1',
        '--json',
      ],
    ]);
  });

  it('queries one exact repository-qualified OrgName through a fixed SOQL argument', () => {
    const directory = temporaryDirectory();
    const orgName = 'q-rgc0uy9-w21i3v9-a2-e';
    const record = {
      Id: '2SR000000000001AAA',
      ScratchOrg: '00D000000000001AAA',
      SignupUsername: 'created@example.invalid',
      OrgName: orgName,
      Status: 'Active',
    };
    const fake = createFakeSalesforce(directory, {
      queries: {[orgName]: [record]},
    });

    assert.deepEqual(
      queryScratchOrgsByName(
        {devHubUsername: 'dev-hub@example.invalid', orgName},
        {sfExecutable: fake.executable}
      ),
      [
        {
          scratchOrgInfoId: record.Id,
          orgId: record.ScratchOrg,
          orgName,
          status: 'Active',
          username: record.SignupUsername,
        },
      ]
    );
    assert.deepEqual(readFakeSalesforceCalls(fake.callsFile), [
      [
        'data',
        'query',
        '--target-org',
        'dev-hub@example.invalid',
        '--query',
        `SELECT Id, ScratchOrg, SignupUsername, OrgName, Status FROM ScratchOrgInfo WHERE OrgName = '${orgName}'`,
        '--json',
      ],
    ]);
  });

  it('validates recognized provisioning and terminal statuses without requiring unfinished IDs', () => {
    for (const status of ['New', 'Creating', 'Error', 'Deleted']) {
      const directory = temporaryDirectory();
      const orgName = 'q-rgc0uy9-w21i3v9-a2-d';
      const fake = createFakeSalesforce(directory, {
        queries: {
          [orgName]: [
            {
              Id: '2SR000000000001AAA',
              ScratchOrg: null,
              SignupUsername: null,
              OrgName: orgName,
              Status: status,
            },
          ],
        },
      });

      assert.deepEqual(
        queryScratchOrgsByName(
          {devHubUsername: 'dev-hub@example.invalid', orgName},
          {sfExecutable: fake.executable}
        ),
        [
          {
            scratchOrgInfoId: '2SR000000000001AAA',
            orgId: null,
            orgName,
            status,
            username: null,
          },
        ]
      );
    }
  });

  it('rejects legacy ambiguous names, unknown states, and multiple records', () => {
    const directory = temporaryDirectory();
    const orgName = 'q-rgc0uy9-w21i3v9-a2-e';
    const record = {
      Id: '2SR000000000001AAA',
      ScratchOrg: null,
      SignupUsername: null,
      OrgName: orgName,
      Status: 'Unexpected',
    };
    const fake = createFakeSalesforce(directory, {
      queries: {[orgName]: [record]},
    });

    assert.throws(() =>
      queryScratchOrgsByName(
        {
          devHubUsername: 'dev-hub@example.invalid',
          orgName: 'quantic-123456789-2-enabled',
        },
        {sfExecutable: fake.executable}
      )
    );
    assert.throws(() =>
      queryScratchOrgsByName(
        {devHubUsername: 'dev-hub@example.invalid', orgName},
        {sfExecutable: fake.executable}
      )
    );

    const duplicateDirectory = temporaryDirectory();
    const duplicateFake = createFakeSalesforce(duplicateDirectory, {
      queries: {
        [orgName]: [
          {...record, Status: 'Error'},
          {...record, Id: '2SR000000000002AAA', Status: 'Deleted'},
        ],
      },
    });
    assert.throws(() =>
      queryScratchOrgsByName(
        {devHubUsername: 'dev-hub@example.invalid', orgName},
        {sfExecutable: duplicateFake.executable}
      )
    );
  });

  it('logs in and deletes only the exact server username through fixed arguments', () => {
    const directory = temporaryDirectory();
    const fake = createFakeSalesforce(directory);
    const username = 'created@example.invalid';

    loginScratchOrgJwt(
      {clientId: 'client-id', jwtKeyFile: '/runner/server.key', username},
      {sfExecutable: fake.executable}
    );
    deleteScratchOrg({username}, {sfExecutable: fake.executable});

    assert.deepEqual(readFakeSalesforceCalls(fake.callsFile), [
      [
        'org',
        'login',
        'jwt',
        '--client-id',
        'client-id',
        '--jwt-key-file',
        '/runner/server.key',
        '--username',
        username,
        '--instance-url',
        'https://test.salesforce.com',
        '--set-default',
        '--json',
      ],
      ['org', 'delete', 'scratch', '--target-org', username, '--no-prompt', '--json'],
    ]);
  });
});
