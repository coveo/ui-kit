import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, describe, it} from 'node:test';
import {
  buildCiHandoffContext,
  buildDeploymentOptions,
  DeploymentDependencies,
  getCiOrgName,
  isCommunityMetadataReadinessFailure,
  Options,
  runCommunityDeployment,
} from './deploy-community';
import {ScratchOrgHandoff} from './scratch-org-handoff';
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
const SCRATCH_ORG_ID = '00D000000000001AAA';
const SCRATCH_ORG_USERNAME = 'scratch-org@example.invalid';
const temporaryDirectories: string[] = [];
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
  deleteOrgOnError: true,
  handoff: {
    commitSha: 'a'.repeat(40),
    lwsStatus: 'enabled',
    repository: 'coveo/ui-kit',
    repositoryId: '987654321',
    runAttempt: 2,
    runId: '123456789',
    trustedRoot: '/tmp',
  },
  jwt: {
    clientId: 'client-id-not-logged',
    keyFile: 'key-file-not-logged',
    username: 'username-not-logged',
  },
  scratchOrg: {
    alias: 'q_rgc0uy9_w21i3v9_a2_e',
    defFile: 'scratch-def.json',
    duration: 1,
    name: 'quantic-test',
  },
};

function temporaryDirectory(): string {
  const directory = fs.mkdtempSync(
    path.join(fs.realpathSync(os.tmpdir()), 'quantic-deployment-options-')
  );
  temporaryDirectories.push(directory);
  return directory;
}

function ciEnvironment(
  trustedRoot: string,
  overrides: NodeJS.ProcessEnv = {}
): NodeJS.ProcessEnv {
  return {
    COMMIT_SHA: 'a'.repeat(40),
    GITHUB_REPOSITORY: 'coveo/ui-kit',
    GITHUB_REPOSITORY_ID: '987654321',
    GITHUB_RUN_ATTEMPT: '2',
    GITHUB_RUN_ID: '123456789',
    GITHUB_SHA: 'a'.repeat(40),
    QUANTIC_LWS_STATUS: 'enabled',
    RUNNER_TEMP: trustedRoot,
    SFDX_AUTH_CLIENT_ID: 'client-id',
    SFDX_AUTH_JWT_KEY_FILE: '/runner/server.key',
    SFDX_AUTH_JWT_USERNAME: 'dev-hub@example.invalid',
    ...overrides,
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

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
  writeScratchOrgHandoff?: (
    context: NonNullable<Options['handoff']>,
    handoff: ScratchOrgHandoff
  ) => Promise<void>;
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
      createScratchOrg: async () => ({
        alias: OPTIONS.scratchOrg.alias,
        orgId: SCRATCH_ORG_ID,
        status: 'Active',
        username: SCRATCH_ORG_USERNAME,
      }),
      deleteOrg: async () => {},
      deployCommunityMetadata: async () =>
        asyncSubmission(COMMUNITY_DEPLOYMENT_ID),
      deploySource: async () => asyncSubmission(SOURCE_DEPLOYMENT_ID),
      getScratchOrg: async () => undefined,
      publishCommunity: async () => publishResponse(),
      resumeMetadataDeployment: async ({deploymentId}) =>
        deployResult(deploymentId),
      ...overrides.sfdx,
    },
    sleep: overrides.sleep ?? (async () => {}),
    waitForUrl: async () => {},
    writeCommunityUrl: async () => {},
    writeScratchOrgHandoff:
      overrides.writeScratchOrgHandoff ?? (async () => {}),
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

  it('publishes the exact scratch-org identity as it becomes usable', async () => {
    const handoffs: ScratchOrgHandoff[] = [];

    await runCommunityDeployment(
      OPTIONS,
      'test-org',
      createDependencies([], {
        writeScratchOrgHandoff: async (_context, handoff) => {
          handoffs.push(handoff);
        },
      })
    );

    assert.deepEqual(
      handoffs.map(({phase, username, communityUrl}) => ({
        phase,
        username,
        communityUrl,
      })),
      [
        {
          phase: 'provisioned',
          username: SCRATCH_ORG_USERNAME,
          communityUrl: null,
        },
        {
          phase: 'published',
          username: SCRATCH_ORG_USERNAME,
          communityUrl: 'https://example.invalid/community',
        },
        {
          phase: 'ready',
          username: SCRATCH_ORG_USERNAME,
          communityUrl: 'https://example.invalid/community',
        },
      ]
    );
  });

  it('never infers CI ownership from an identically aliased org', async () => {
    let aliasLookups = 0;
    const handoffs: ScratchOrgHandoff[] = [];

    await runCommunityDeployment(
      OPTIONS,
      'test-org',
      createDependencies([], {
        sfdx: {
          getScratchOrg: async () => {
            aliasLookups++;
            return {
              alias: OPTIONS.scratchOrg.alias,
              orgId: '00D000000000002AAA',
              status: 'Active',
              username: 'different-attempt@example.invalid',
            };
          },
        },
        writeScratchOrgHandoff: async (_context, handoff) => {
          handoffs.push(handoff);
        },
      })
    );

    assert.equal(aliasLookups, 0);
    assert.ok(
      handoffs.every(({username}) => username === SCRATCH_ORG_USERNAME)
    );
  });

  it('retains ownership evidence and marks an exact org deleted after partial setup failure', async () => {
    const handoffs: ScratchOrgHandoff[] = [];
    const deletedUsernames: string[] = [];
    const setupError = new Error('community setup failed');
    const dependencies = createDependencies([], {
      sfdx: {
        createCommunity: async () => {
          throw setupError;
        },
        deleteOrg: async (username) => {
          deletedUsernames.push(username);
        },
      },
      writeScratchOrgHandoff: async (_context, handoff) => {
        handoffs.push(handoff);
      },
    });

    await assert.rejects(
      runCommunityDeployment(OPTIONS, 'test-org', dependencies),
      (error) => error === setupError
    );
    assert.deepEqual(deletedUsernames, [SCRATCH_ORG_USERNAME]);
    assert.deepEqual(
      handoffs.map(({phase}) => phase),
      ['provisioned', 'deleted']
    );
  });

  it('keeps cancellation ownership evidence until exact cleanup completes', async () => {
    const handoffs: ScratchOrgHandoff[] = [];
    const deletedUsernames: string[] = [];
    const cancellation = Object.assign(new Error('cancelled'), {
      name: 'AbortError',
    });
    const dependencies = createDependencies([], {
      sfdx: {
        deleteOrg: async (username) => {
          deletedUsernames.push(username);
        },
      },
      writeScratchOrgHandoff: async (_context, handoff) => {
        handoffs.push(handoff);
      },
    });
    dependencies.waitForUrl = async () => {
      throw cancellation;
    };

    await assert.rejects(
      runCommunityDeployment(OPTIONS, 'test-org', dependencies),
      (error) => error === cancellation
    );
    assert.deepEqual(deletedUsernames, [SCRATCH_ORG_USERNAME]);
    assert.deepEqual(
      handoffs.map(({phase}) => phase),
      ['provisioned', 'published', 'deleted']
    );
  });

  it('does not publish ownership evidence when scratch-org creation fails', async () => {
    const handoffs: ScratchOrgHandoff[] = [];
    const deletedUsernames: string[] = [];
    const creationError = new Error('creation failed');
    const dependencies = createDependencies([], {
      sfdx: {
        createScratchOrg: async () => {
          throw creationError;
        },
        deleteOrg: async (username) => {
          deletedUsernames.push(username);
        },
      },
      writeScratchOrgHandoff: async (_context, handoff) => {
        handoffs.push(handoff);
      },
    });

    await assert.rejects(
      runCommunityDeployment(OPTIONS, 'test-org', dependencies),
      (error) => error === creationError
    );
    assert.deepEqual(handoffs, []);
    assert.deepEqual(deletedUsernames, []);
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
    const deletedUsernames: string[] = [];
    const terminalError = deployResult(COMMUNITY_DEPLOYMENT_ID, 'Failed');
    let communityStarts = 0;
    const dependencies = createDependencies(telemetryLines, {
      sfdx: {
        deleteOrg: async (username) => {
          deletedUsernames.push(username);
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
    assert.deepEqual(deletedUsernames, [SCRATCH_ORG_USERNAME]);
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
    const deletedUsernames: string[] = [];
    const dependencies = createDependencies([], {
      metadataDeploymentPolicy: {...POLICY, maxResumeAttempts: 1},
      sfdx: {
        deleteOrg: async (username) => {
          deletedUsernames.push(username);
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
    assert.deepEqual(deletedUsernames, [SCRATCH_ORG_USERNAME]);
  });

  it('cleans up after the hard overall deadline', async () => {
    let currentTime = 0;
    const deletedUsernames: string[] = [];
    const dependencies = createDependencies([], {
      metadataDeploymentPolicy: {
        ...POLICY,
        overallTimeoutMs: 20,
        retryDelayMs: 5,
      },
      now: () => currentTime,
      sfdx: {
        deleteOrg: async (username) => {
          deletedUsernames.push(username);
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
    assert.deepEqual(deletedUsernames, [SCRATCH_ORG_USERNAME]);
  });
});

describe('environment-injected CI deployment options', () => {
  it('builds exact repository-qualified options for both LWS variants', async () => {
    for (const lwsStatus of ['enabled', 'disabled'] as const) {
      const trustedRoot = temporaryDirectory();
      const definitionFile = path.join(
        trustedRoot,
        `lws-${lwsStatus}-scratch-def.json`
      );
      const alias = `Quantic__LWS_${lwsStatus}`;
      fs.writeFileSync(
        definitionFile,
        JSON.stringify({edition: 'Developer', orgName: alias})
      );
      const environment = ciEnvironment(trustedRoot, {
        QUANTIC_LWS_STATUS: lwsStatus,
      });

      const context = buildCiHandoffContext(alias, environment);
      const options = await buildDeploymentOptions(
        definitionFile,
        ['node', 'deploy-community.ts', '--ci'],
        environment
      );
      const expectedName = `q-rgc0uy9-w21i3v9-a2-${
        lwsStatus === 'enabled' ? 'e' : 'd'
      }`;

      assert.deepEqual(context, {
        commitSha: 'a'.repeat(40),
        lwsStatus,
        repository: 'coveo/ui-kit',
        repositoryId: '987654321',
        runAttempt: 2,
        runId: '123456789',
        trustedRoot,
      });
      assert.deepEqual(options.handoff, context);
      assert.equal(options.scratchOrg.alias, expectedName.replace(/-/g, '_'));
      assert.equal(options.scratchOrg.name, expectedName);
      assert.equal(options.scratchOrg.duration, 1);
      assert.deepEqual(options.jwt, {
        clientId: 'client-id',
        keyFile: '/runner/server.key',
        username: 'dev-hub@example.invalid',
      });
      assert.deepEqual(
        JSON.parse(fs.readFileSync(options.scratchOrg.defFile, 'utf8')),
        {edition: 'Developer', orgName: expectedName}
      );
    }
  });

  it('rejects missing and malformed producer variables and trusted roots', async () => {
    const trustedRoot = temporaryDirectory();
    const definitionFile = path.join(trustedRoot, 'scratch-def.json');
    fs.writeFileSync(
      definitionFile,
      JSON.stringify({edition: 'Developer', orgName: 'Quantic__LWS_enabled'})
    );
    const valid = ciEnvironment(trustedRoot);
    for (const variable of [
      'COMMIT_SHA',
      'GITHUB_REPOSITORY',
      'GITHUB_REPOSITORY_ID',
      'GITHUB_RUN_ATTEMPT',
      'GITHUB_RUN_ID',
      'GITHUB_SHA',
      'QUANTIC_LWS_STATUS',
      'RUNNER_TEMP',
      'SFDX_AUTH_CLIENT_ID',
      'SFDX_AUTH_JWT_KEY_FILE',
      'SFDX_AUTH_JWT_USERNAME',
    ]) {
      await assert.rejects(
        buildDeploymentOptions(
          definitionFile,
          ['node', 'deploy-community.ts', '--ci'],
          {...valid, [variable]: undefined}
        ),
        new RegExp(variable)
      );
    }

    const malformed: NodeJS.ProcessEnv[] = [
      {GITHUB_REPOSITORY: 'missing-slash'},
      {GITHUB_REPOSITORY_ID: '0'},
      {GITHUB_REPOSITORY_ID: '18446744073709551616'},
      {GITHUB_RUN_ATTEMPT: '0'},
      {GITHUB_RUN_ATTEMPT: '1.5'},
      {GITHUB_RUN_ID: '0'},
      {GITHUB_SHA: 'not-a-sha', COMMIT_SHA: 'not-a-sha'},
      {QUANTIC_LWS_STATUS: 'other'},
      {RUNNER_TEMP: 'relative/path'},
      {
        RUNNER_TEMP: `${trustedRoot}${path.sep}..${path.sep}${path.basename(
          trustedRoot
        )}`,
      },
    ];
    for (const overrides of malformed) {
      await assert.rejects(
        buildDeploymentOptions(
          definitionFile,
          ['node', 'deploy-community.ts', '--ci'],
          {...valid, ...overrides}
        )
      );
    }
  });

  it('rejects commit mismatches and alias/LWS mismatches', async () => {
    const trustedRoot = temporaryDirectory();
    const environment = ciEnvironment(trustedRoot);
    assert.throws(
      () =>
        buildCiHandoffContext('Quantic__LWS_enabled', {
          ...environment,
          COMMIT_SHA: 'b'.repeat(40),
        }),
      /COMMIT_SHA must match GITHUB_SHA/
    );
    assert.throws(
      () => buildCiHandoffContext('Quantic__LWS_disabled', environment),
      /does not match QUANTIC_LWS_STATUS/
    );
  });
});

describe('getCiOrgName', () => {
  it('isolates repositories, runs, LWS variants, and workflow attempts', () => {
    const enabledAttemptOne = getCiOrgName(
      '987654321',
      '123456789',
      1,
      'enabled'
    );

    assert.notEqual(
      enabledAttemptOne,
      getCiOrgName('987654321', '123456789', 2, 'enabled')
    );
    assert.notEqual(
      enabledAttemptOne,
      getCiOrgName('987654321', '123456789', 1, 'disabled')
    );
    assert.notEqual(
      enabledAttemptOne,
      getCiOrgName('987654321', '987654321', 1, 'enabled')
    );
    assert.notEqual(
      enabledAttemptOne,
      getCiOrgName('11111111', '123456789', 1, 'enabled')
    );
  });
});
