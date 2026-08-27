import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {createScratchOrg, deleteOrg} from './sfdx-commands';
import type {SfJsonCommandRunner} from './sfdx-commands';

describe('scratch-org Salesforce commands', () => {
  it('creates with fixed arguments and sanitizes the Salesforce response', async () => {
    const calls: Array<{args: readonly string[]; timeoutMs: number}> = [];
    const runSfCommand: SfJsonCommandRunner = async <T>(
      args: readonly string[],
      timeoutMs: number
    ) => {
      calls.push({args, timeoutMs});
      return {
        status: 0,
        result: {
          alias: 'Quantic__LWS_enabled',
          orgId: '00D000000000001AAA',
          status: 'Active',
          username: 'created@example.invalid',
          accessToken: 'not-returned-by-adapter',
        },
      } as T;
    };

    const result = await createScratchOrg(
      {
        alias: 'Quantic__LWS_enabled',
        defFile: '/workspace/scratch-def.json',
        duration: 1,
      },
      runSfCommand
    );

    assert.deepEqual(result, {
      alias: 'Quantic__LWS_enabled',
      orgId: '00D000000000001AAA',
      status: 'Active',
      username: 'created@example.invalid',
    });
    assert.deepEqual(calls[0].args, [
      'org',
      'create',
      'scratch',
      '--set-default',
      '--definition-file',
      '/workspace/scratch-def.json',
      '--alias',
      'Quantic__LWS_enabled',
      '--duration-days',
      '1',
    ]);
    assert.ok(calls[0].timeoutMs > 0);
  });

  it('deletes only a validated exact target with fixed arguments', async () => {
    const calls: Array<{args: readonly string[]; timeoutMs: number}> = [];
    const runSfCommand: SfJsonCommandRunner = async <T>(
      args: readonly string[],
      timeoutMs: number
    ) => {
      calls.push({args, timeoutMs});
      return {status: 0, result: {}} as T;
    };

    await deleteOrg('created@example.invalid', runSfCommand);

    assert.deepEqual(calls[0].args, [
      'org',
      'delete',
      'scratch',
      '--target-org',
      'created@example.invalid',
      '--no-prompt',
    ]);
    await assert.rejects(
      deleteOrg('created@example.invalid;other-command', runSfCommand),
      /deletion target is invalid/
    );
    assert.equal(calls.length, 1);
  });
});
