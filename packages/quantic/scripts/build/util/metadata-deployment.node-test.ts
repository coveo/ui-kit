import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {
  MetadataDeploymentDependencies,
  MetadataDeploymentPolicy,
  MetadataDeploymentProtocolError,
  MetadataDeploymentRetryError,
  MetadataDeploymentSubmissionError,
  runMetadataDeployment,
} from './metadata-deployment';

const DEPLOYMENT_ID = '0Af000000000001AAA';
const OTHER_DEPLOYMENT_ID = '0Af000000000002AAA';
const POLICY: MetadataDeploymentPolicy = {
  maxResumeAttempts: 3,
  overallTimeoutMs: 1000,
  retryDelayMs: 10,
  waitMinutes: 10,
};

function asyncSubmission(deploymentId: string = DEPLOYMENT_ID) {
  return {
    result: {
      done: false,
      files: [],
      id: deploymentId,
      status: 'Queued',
    },
    status: 0,
  };
}

function activeStart(deploymentId: string = DEPLOYMENT_ID) {
  return {
    result: {done: false, id: deploymentId, status: 'InProgress'},
    status: 69,
  };
}

function resumeTimeout(deploymentId: string = DEPLOYMENT_ID) {
  return {
    data: {id: deploymentId},
    message: 'Metadata API request failed: The client has timed out',
  };
}

function deployResult(status: string, deploymentId: string = DEPLOYMENT_ID) {
  const succeeded = status === 'Succeeded';
  const active = ['Canceling', 'Finalizing', 'InProgress', 'Pending'].includes(
    status
  );
  return {
    result: {
      done: !active,
      id: deploymentId,
      status,
      success: succeeded,
    },
    status: active ? 69 : succeeded ? 0 : 1,
  };
}

function createDependencies(
  overrides: Partial<MetadataDeploymentDependencies> = {}
) {
  let currentTime = 0;
  const logs: string[] = [];
  const dependencies: MetadataDeploymentDependencies = {
    log: (message) => logs.push(message),
    now: () => currentTime,
    resume: async () => deployResult('Succeeded'),
    sleep: async (durationMs) => {
      currentTime += durationMs;
    },
    start: async () => asyncSubmission(),
    ...overrides,
  };
  return {
    advance: (durationMs: number) => {
      currentTime += durationMs;
    },
    dependencies,
    logs,
  };
}

describe('runMetadataDeployment', () => {
  it('submits one async deployment and resumes only its exact ID', async () => {
    const startTimeouts: number[] = [];
    const resumeCalls: Array<{
      deploymentId: string;
      executionTimeoutMs: number;
      waitMinutes: number;
    }> = [];
    const {dependencies, logs} = createDependencies({
      resume: async (deploymentId, waitMinutes, executionTimeoutMs) => {
        resumeCalls.push({deploymentId, executionTimeoutMs, waitMinutes});
        return deployResult('Succeeded');
      },
      start: async (executionTimeoutMs) => {
        startTimeouts.push(executionTimeoutMs);
        return asyncSubmission();
      },
    });

    await runMetadataDeployment({
      dependencies,
      policy: POLICY,
      step: 'source_deployment',
    });

    assert.deepEqual(startTimeouts, [1000]);
    assert.deepEqual(resumeCalls, [
      {deploymentId: DEPLOYMENT_ID, executionTimeoutMs: 1000, waitMinutes: 10},
    ]);
    assert.equal(
      logs.filter(
        (line) =>
          line.includes('"action":"start"') &&
          line.includes('"event":"attempt"')
      ).length,
      1
    );
  });

  it('recovers the exact ID from a pinned-CLI active start response', async () => {
    let starts = 0;
    const resumedIds: string[] = [];
    const {dependencies} = createDependencies({
      resume: async (deploymentId) => {
        resumedIds.push(deploymentId);
        return deployResult('Succeeded');
      },
      start: async () => {
        starts++;
        throw activeStart();
      },
    });

    await runMetadataDeployment({
      dependencies,
      policy: POLICY,
      step: 'source_deployment',
    });

    assert.equal(starts, 1);
    assert.deepEqual(resumedIds, [DEPLOYMENT_ID]);
  });

  it('handles real client-timeout shapes with repeated same-ID resumes', async () => {
    let starts = 0;
    const resumedIds: string[] = [];
    const {dependencies} = createDependencies({
      resume: async (deploymentId) => {
        resumedIds.push(deploymentId);
        if (resumedIds.length < 3) {
          throw resumeTimeout();
        }
        return deployResult('Succeeded');
      },
      start: async () => {
        starts++;
        return asyncSubmission();
      },
    });

    await runMetadataDeployment({
      dependencies,
      policy: POLICY,
      step: 'community_metadata_deployment',
    });

    assert.equal(starts, 1);
    assert.deepEqual(resumedIds, [DEPLOYMENT_ID, DEPLOYMENT_ID, DEPLOYMENT_ID]);
  });

  it('fails after bounded resume exhaustion without starting again', async () => {
    let starts = 0;
    let resumes = 0;
    const {dependencies} = createDependencies({
      resume: async () => {
        resumes++;
        throw resumeTimeout();
      },
      start: async () => {
        starts++;
        return asyncSubmission();
      },
    });

    await assert.rejects(
      runMetadataDeployment({
        dependencies,
        policy: {...POLICY, maxResumeAttempts: 2},
        step: 'community_metadata_deployment',
      }),
      MetadataDeploymentRetryError
    );
    assert.equal(starts, 1);
    assert.equal(resumes, 2);
  });

  it('rejects changed, invalid, and missing IDs from active resume responses', async () => {
    const errors = [
      resumeTimeout(OTHER_DEPLOYMENT_ID),
      resumeTimeout('not-a-salesforce-id'),
      {data: {}, message: resumeTimeout().message},
    ];

    for (const resumeError of errors) {
      let starts = 0;
      let resumes = 0;
      const {dependencies} = createDependencies({
        resume: async () => {
          resumes++;
          throw resumeError;
        },
        start: async () => {
          starts++;
          return asyncSubmission();
        },
      });

      await assert.rejects(
        runMetadataDeployment({
          dependencies,
          policy: POLICY,
          step: 'community_metadata_deployment',
        }),
        MetadataDeploymentProtocolError
      );
      assert.equal(starts, 1);
      assert.equal(resumes, 1);
    }
  });

  it('rejects missing and invalid IDs from async submission responses', async () => {
    for (const result of [
      {result: {done: false, status: 'Queued'}, status: 0},
      asyncSubmission('invalid-id'),
    ]) {
      let starts = 0;
      const {dependencies} = createDependencies({
        start: async () => {
          starts++;
          return result;
        },
      });

      await assert.rejects(
        runMetadataDeployment({
          dependencies,
          policy: POLICY,
          step: 'source_deployment',
        }),
        MetadataDeploymentProtocolError
      );
      assert.equal(starts, 1);
    }
  });

  it('continues through Finalizing and completes on the same ID', async () => {
    const resumedIds: string[] = [];
    const {dependencies} = createDependencies({
      resume: async (deploymentId) => {
        resumedIds.push(deploymentId);
        return deployResult(
          resumedIds.length === 1 ? 'Finalizing' : 'Succeeded'
        );
      },
    });

    await runMetadataDeployment({
      dependencies,
      policy: POLICY,
      step: 'source_deployment',
    });

    assert.deepEqual(resumedIds, [DEPLOYMENT_ID, DEPLOYMENT_ID]);
  });

  it('treats FinalizingFailed as terminal without another submission', async () => {
    const terminalError = deployResult('FinalizingFailed');
    let starts = 0;
    let resumes = 0;
    const {dependencies} = createDependencies({
      resume: async () => {
        resumes++;
        throw terminalError;
      },
      start: async () => {
        starts++;
        return asyncSubmission();
      },
    });

    await assert.rejects(
      runMetadataDeployment({
        dependencies,
        policy: POLICY,
        step: 'source_deployment',
      }),
      (error) => error === terminalError
    );
    assert.equal(starts, 1);
    assert.equal(resumes, 1);
  });

  it('retries transient resume transport failures against the same ID', async () => {
    let sleeps = 0;
    const resumedIds: string[] = [];
    const {dependencies} = createDependencies({
      resume: async (deploymentId) => {
        resumedIds.push(deploymentId);
        if (resumedIds.length === 1) {
          throw Object.assign(new Error('socket hang up'), {
            code: 'ECONNRESET',
          });
        }
        return deployResult('Succeeded');
      },
      sleep: async () => {
        sleeps++;
      },
    });

    await runMetadataDeployment({
      dependencies,
      policy: POLICY,
      step: 'source_deployment',
    });

    assert.deepEqual(resumedIds, [DEPLOYMENT_ID, DEPLOYMENT_ID]);
    assert.equal(sleeps, 1);
  });

  it('fails closed after an ambiguous async submission transport error', async () => {
    let starts = 0;
    let resumes = 0;
    const {dependencies} = createDependencies({
      resume: async () => {
        resumes++;
        return deployResult('Succeeded');
      },
      start: async () => {
        starts++;
        throw Object.assign(new Error('socket hang up'), {code: 'ECONNRESET'});
      },
    });

    await assert.rejects(
      runMetadataDeployment({
        dependencies,
        policy: POLICY,
        step: 'source_deployment',
      }),
      MetadataDeploymentSubmissionError
    );
    assert.equal(starts, 1);
    assert.equal(resumes, 0);
  });

  it('starts a fresh bounded logical attempt only for classified readiness failures', async () => {
    const readinessFailure = deployResult('Failed');
    const submittedIds = [DEPLOYMENT_ID, OTHER_DEPLOYMENT_ID];
    const resumedIds: string[] = [];
    let starts = 0;
    let sleeps = 0;
    const {dependencies} = createDependencies({
      resume: async (deploymentId) => {
        resumedIds.push(deploymentId);
        if (deploymentId === DEPLOYMENT_ID) {
          throw readinessFailure;
        }
        return deployResult('Succeeded', OTHER_DEPLOYMENT_ID);
      },
      sleep: async () => {
        sleeps++;
      },
      start: async () => asyncSubmission(submittedIds[starts++]),
    });

    await runMetadataDeployment({
      dependencies,
      isRetryableTerminalFailure: (error) => error === readinessFailure,
      maxLogicalAttempts: 2,
      policy: POLICY,
      step: 'community_metadata_deployment',
    });

    assert.equal(starts, 2);
    assert.deepEqual(resumedIds, [DEPLOYMENT_ID, OTHER_DEPLOYMENT_ID]);
    assert.equal(sleeps, 1);
  });

  it('does not retry unclassified completed deployment failures', async () => {
    const contentFailure = deployResult('Failed');
    let starts = 0;
    const {dependencies} = createDependencies({
      resume: async () => {
        throw contentFailure;
      },
      start: async () => {
        starts++;
        return asyncSubmission();
      },
    });

    await assert.rejects(
      runMetadataDeployment({
        dependencies,
        isRetryableTerminalFailure: () => false,
        maxLogicalAttempts: 3,
        policy: POLICY,
        step: 'community_metadata_deployment',
      }),
      (error) => error === contentFailure
    );
    assert.equal(starts, 1);
  });

  it('passes exact remaining milliseconds and stops at the hard deadline', async () => {
    const resumeTimeouts: number[] = [];
    const {advance, dependencies} = createDependencies({
      resume: async (_deploymentId, _waitMinutes, executionTimeoutMs) => {
        resumeTimeouts.push(executionTimeoutMs);
        throw Object.assign(new Error('socket hang up'), {code: 'ECONNRESET'});
      },
      start: async () => {
        advance(20);
        return asyncSubmission();
      },
    });

    await assert.rejects(
      runMetadataDeployment({
        dependencies,
        policy: {...POLICY, overallTimeoutMs: 25, retryDelayMs: 10},
        step: 'source_deployment',
      }),
      MetadataDeploymentRetryError
    );
    assert.deepEqual(resumeTimeouts, [5]);
  });
});
