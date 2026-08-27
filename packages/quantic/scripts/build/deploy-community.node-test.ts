import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {
  DeploymentDependencies,
  isCommunityMetadataReadinessFailure,
  Options,
  runCommunityDeployment,
} from './deploy-community';
import {
  MetadataDeploymentPolicy,
  MetadataDeploymentRetryError,
} from './util/metadata-deployment';
import {
  SfdxMetadataDeployResponse,
  SfdxPublishCommunityResponse,
} from './util/sfdx-commands';
import {DEPLOYMENT_TELEMETRY_PREFIX} from './util/telemetry';

const SOURCE_DEPLOYMENT_ID = '0Af000000000001AAA';
const COMMUNITY_DEPLOYMENT_ID = '0Af000000000002AAA';
const SECOND_COMMUNITY_DEPLOYMENT_ID = '0Af000000000003AAA';
const POLICY: MetadataDeploymentPolicy = {
  maxResumeAttempts: 2,
  overallTimeoutMs: 1000,
  retryDelayMs: 0,
  waitMinutes: 1,
};
const OPTIONS: Options = {
  ci: true,
  community: {
    name: 'Quantic Examples',
    path: 'examples',
    template: 'Build Your Own',
  },
  deleteOldOrgs: true,
  deleteOrgOnError: true,
  jwt: {
    clientId: 'client-id-not-logged',
    keyFile: 'key-file-not-logged',
    username: 'username-not-logged',
  },
  scratchOrg: {
    alias: 'test-org',
    defFile: 'scratch-def.json',
    duration: 1,
    name: 'quantic-test',
  },
};

function asyncSubmission(deploymentId: string): SfdxMetadataDeployResponse {
  return {
    result: {done: false, id: deploymentId, status: 'Queued'},
    status: 0,
  };
}

function deployResult(
  deploymentId: string,
  status = 'Succeeded'
): SfdxMetadataDeployResponse {
  return {
    result: {
      done: true,
      id: deploymentId,
      status,
      success: status === 'Succeeded',
    },
    status: status === 'Succeeded' ? 0 : 1,
  };
}

function readinessFailure(
  deploymentId: string = COMMUNITY_DEPLOYMENT_ID
): SfdxMetadataDeployResponse {
  return {
    result: {
      details: {
        componentFailures: {
          componentType: 'ExperienceBundle',
          fullName: 'Quantic_Examples1',
          problem:
            'In field: Network - no Network named Quantic Examples found',
          problemType: 'Error',
        },
      },
      done: true,
      id: deploymentId,
      status: 'Failed',
      success: false,
    },
    status: 1,
  };
}

function publishResponse(): SfdxPublishCommunityResponse {
  return {
    result: {url: 'https://example.invalid/community'},
    status: 0,
  };
}

interface DependencyOverrides {
  metadataDeploymentPolicy?: MetadataDeploymentPolicy;
  now?: () => number;
  reportCleanupError?: (error: unknown) => void;
  sfdx?: Partial<DeploymentDependencies['sfdx']>;
  sleep?: (durationMs: number) => Promise<void>;
}

function createDependencies(
  telemetryLines: string[],
  overrides: DependencyOverrides = {}
): DeploymentDependencies {
  return {
    metadataDeploymentPolicy: overrides.metadataDeploymentPolicy ?? POLICY,
    now: overrides.now ?? (() => 0),
    reportCleanupError: overrides.reportCleanupError ?? (() => {}),
    sfdx: {
      authorizeOrg: async () => {},
      createCommunity: async () => {},
      createScratchOrg: async () => {},
      deleteOldScratchOrgs: async () => 0,
      deleteOrg: async () => {},
      deployCommunityMetadata: async () =>
        asyncSubmission(COMMUNITY_DEPLOYMENT_ID),
      deploySource: async () => asyncSubmission(SOURCE_DEPLOYMENT_ID),
      orgExists: async () => false,
      publishCommunity: async () => publishResponse(),
      resumeMetadataDeployment: async ({deploymentId}) =>
        deployResult(deploymentId),
      ...overrides.sfdx,
    },
    sleep: overrides.sleep ?? (async () => {}),
    waitForUrl: async () => {},
    writeCommunityUrl: async () => {},
    writeTelemetry: (line) => telemetryLines.push(line),
  };
}

describe('runCommunityDeployment', () => {
  it('records secret-free durations for every deployment phase on success', async () => {
    const telemetryLines: string[] = [];

    const url = await runCommunityDeployment(
      OPTIONS,
      'test-org',
      createDependencies(telemetryLines)
    );

    assert.equal(url, 'https://example.invalid/community');
    const events = telemetryLines.map((line) => {
      assert.ok(line.startsWith(DEPLOYMENT_TELEMETRY_PREFIX));
      return JSON.parse(line.slice(DEPLOYMENT_TELEMETRY_PREFIX.length)) as {
        durationMs: number;
        event: string;
        status: string;
        step: string;
        version: number;
      };
    });
    assert.deepEqual(
      events.map(({step}) => step),
      [
        'authorization',
        'old_org_deletion',
        'scratch_org_creation',
        'community_creation',
        'source_deployment',
        'community_metadata_deployment',
        'publication',
        'availability_checks',
      ]
    );
    assert.ok(
      events.every(
        ({durationMs, event, status, version}) =>
          durationMs >= 0 &&
          event === 'step_duration' &&
          status === 'success' &&
          version === 1
      )
    );
    assert.doesNotMatch(
      telemetryLines.join('\n'),
      /client-id-not-logged|key-file-not-logged|username-not-logged|example\.invalid/
    );
  });

  it('classifies only the explicit Experience Cloud readiness fixture', () => {
    const fixture = readinessFailure();
    assert.equal(isCommunityMetadataReadinessFailure(fixture), true);
    assert.equal(
      isCommunityMetadataReadinessFailure({
        ...fixture,
        result: {
          ...fixture.result,
          details: {
            componentFailures: {
              componentType: 'ExperienceBundle',
              fullName: 'Quantic_Examples1',
              problem: 'Invalid value in route content',
            },
          },
        },
      }),
      false
    );
    assert.equal(
      isCommunityMetadataReadinessFailure(
        deployResult(COMMUNITY_DEPLOYMENT_ID, 'Failed')
      ),
      false
    );
  });

  it('starts a fresh logical attempt for the known readiness failure', async () => {
    const telemetryLines: string[] = [];
    const submittedIds = [
      COMMUNITY_DEPLOYMENT_ID,
      SECOND_COMMUNITY_DEPLOYMENT_ID,
    ];
    let communityStarts = 0;
    const resumedIds: string[] = [];
    const dependencies = createDependencies(telemetryLines, {
      sfdx: {
        deployCommunityMetadata: async () =>
          asyncSubmission(submittedIds[communityStarts++]),
        resumeMetadataDeployment: async ({deploymentId}) => {
          if (deploymentId === SOURCE_DEPLOYMENT_ID) {
            return deployResult(deploymentId);
          }
          resumedIds.push(deploymentId);
          if (deploymentId === COMMUNITY_DEPLOYMENT_ID) {
            throw readinessFailure();
          }
          return deployResult(deploymentId);
        },
      },
    });

    await runCommunityDeployment(OPTIONS, 'test-org', dependencies);

    assert.equal(communityStarts, 2);
    assert.deepEqual(resumedIds, [
      COMMUNITY_DEPLOYMENT_ID,
      SECOND_COMMUNITY_DEPLOYMENT_ID,
    ]);
  });

  it('cleans up after a terminal content deployment failure without retrying it', async () => {
    const telemetryLines: string[] = [];
    const deletedAliases: string[] = [];
    const terminalError = deployResult(COMMUNITY_DEPLOYMENT_ID, 'Failed');
    let communityStarts = 0;
    const dependencies = createDependencies(telemetryLines, {
      sfdx: {
        deleteOrg: async (alias) => {
          deletedAliases.push(alias);
        },
        deployCommunityMetadata: async () => {
          communityStarts++;
          return asyncSubmission(COMMUNITY_DEPLOYMENT_ID);
        },
        resumeMetadataDeployment: async ({deploymentId}) => {
          if (deploymentId === COMMUNITY_DEPLOYMENT_ID) {
            throw terminalError;
          }
          return deployResult(deploymentId);
        },
      },
    });

    await assert.rejects(
      runCommunityDeployment(OPTIONS, 'test-org', dependencies),
      (error) => error === terminalError
    );
    assert.equal(communityStarts, 1);
    assert.deepEqual(deletedAliases, ['test-org']);
    assert.match(
      telemetryLines.join('\n'),
      /"status":"failure","step":"community_metadata_deployment"/
    );
  });

  it('preserves the original deployment error when cleanup also fails', async () => {
    const terminalError = deployResult(COMMUNITY_DEPLOYMENT_ID, 'Failed');
    const cleanupError = new Error('cleanup failed');
    const reportedCleanupErrors: unknown[] = [];
    const dependencies = createDependencies([], {
      reportCleanupError: (error) => reportedCleanupErrors.push(error),
      sfdx: {
        deleteOrg: async () => {
          throw cleanupError;
        },
        resumeMetadataDeployment: async ({deploymentId}) => {
          if (deploymentId === COMMUNITY_DEPLOYMENT_ID) {
            throw terminalError;
          }
          return deployResult(deploymentId);
        },
      },
    });

    await assert.rejects(
      runCommunityDeployment(OPTIONS, 'test-org', dependencies),
      (error) => error === terminalError
    );
    assert.deepEqual(reportedCleanupErrors, [cleanupError]);
  });

  it('cleans up after resume exhaustion', async () => {
    const deletedAliases: string[] = [];
    const dependencies = createDependencies([], {
      metadataDeploymentPolicy: {...POLICY, maxResumeAttempts: 1},
      sfdx: {
        deleteOrg: async (alias) => {
          deletedAliases.push(alias);
        },
        resumeMetadataDeployment: async ({deploymentId}) => {
          if (deploymentId === COMMUNITY_DEPLOYMENT_ID) {
            throw {
              data: {id: deploymentId},
              message: 'Metadata API request failed: The client has timed out',
            };
          }
          return deployResult(deploymentId);
        },
      },
    });

    await assert.rejects(
      runCommunityDeployment(OPTIONS, 'test-org', dependencies),
      MetadataDeploymentRetryError
    );
    assert.deepEqual(deletedAliases, ['test-org']);
  });

  it('cleans up after the hard overall deadline', async () => {
    let currentTime = 0;
    const deletedAliases: string[] = [];
    const dependencies = createDependencies([], {
      metadataDeploymentPolicy: {
        ...POLICY,
        overallTimeoutMs: 20,
        retryDelayMs: 5,
      },
      now: () => currentTime,
      sfdx: {
        deleteOrg: async (alias) => {
          deletedAliases.push(alias);
        },
        resumeMetadataDeployment: async ({deploymentId}) => {
          if (deploymentId === COMMUNITY_DEPLOYMENT_ID) {
            currentTime = 20;
            throw Object.assign(new Error('socket hang up'), {
              code: 'ECONNRESET',
            });
          }
          return deployResult(deploymentId);
        },
      },
    });

    await assert.rejects(
      runCommunityDeployment(OPTIONS, 'test-org', dependencies),
      MetadataDeploymentRetryError
    );
    assert.deepEqual(deletedAliases, ['test-org']);
  });
});
