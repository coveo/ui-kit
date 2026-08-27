import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {
  sfdx,
  SfCommandExecutionTimeoutError,
  SfCommandExecutorOptions,
  sfCommand,
} from './sfdx';

describe('sfdx', () => {
  it('rejects when command execution fails without stdout', async () => {
    const executionError = new Error('spawn failed');

    await assert.rejects(
      sfdx('org list', (_command, callback) => {
        callback(executionError, '', 'failure');
      }),
      (error) => error === executionError
    );
  });

  it('rejects parsed Salesforce JSON when the command exits unsuccessfully', async () => {
    const response = {result: {id: '0Af000000000001AAA'}, status: 69};

    await assert.rejects(
      sfdx('project deploy start', (_command, callback) => {
        callback(new Error('exit 69'), JSON.stringify(response), '');
      }),
      (error) => {
        assert.deepEqual(error, response);
        return true;
      }
    );
  });

  it('passes fixed arguments and the exact timeout to child_process execution', async () => {
    const response = {
      result: {
        done: false,
        files: [],
        id: '0Af000000000001AAA',
        status: 'Queued',
      },
      status: 0,
    };
    let executable = '';
    let args: readonly string[] = [];
    let options: SfCommandExecutorOptions | undefined;

    const result = await sfCommand(
      ['project', 'deploy', 'start', '--async'],
      321,
      (receivedExecutable, receivedArgs, receivedOptions, callback) => {
        executable = receivedExecutable;
        args = receivedArgs;
        options = receivedOptions;
        callback(null, JSON.stringify(response), '');
        return {kill: () => true};
      }
    );

    assert.deepEqual(result, response);
    assert.equal(executable, 'sf');
    assert.deepEqual(args, ['project', 'deploy', 'start', '--async', '--json']);
    assert.equal(options?.timeout, 321);
  });

  it('kills and rejects a never-settling child at the hard deadline', async () => {
    let killedWith: NodeJS.Signals | number | undefined;

    await assert.rejects(
      sfCommand(['project', 'deploy', 'resume'], 10, () => ({
        kill: (signal) => {
          killedWith = signal;
          return true;
        },
      })),
      SfCommandExecutionTimeoutError
    );

    assert.equal(killedWith, 'SIGTERM');
  });
});
