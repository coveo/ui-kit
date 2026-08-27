import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import waitOn from 'wait-on';
import {StepLogger, StepsRunner} from './util/log';
import {
  MetadataDeploymentPolicy,
  runMetadataDeployment,
} from './util/metadata-deployment';
import * as sfdx from './util/sfdx-commands';
import {SfdxJWTAuth} from './util/sfdx-commands';
import {
  buildScratchOrgIdentity,
  buildScratchOrgName,
  createScratchOrgHandoff,
  LwsStatus,
  ScratchOrgHandoff,
  ScratchOrgHandoffContext,
  ScratchOrgHandoffPhase,
  writeScratchOrgHandoff,
} from './scratch-org-handoff';
import {
  getOrgNameFromScratchDefFile,
  getScratchOrgDefPath,
} from './util/scratchOrgDefUtils';
import {DeploymentTelemetry} from './util/telemetry';

const COMMUNITY_CREATION_MAX_ATTEMPTS = 5;
const COMMUNITY_CREATION_RETRY_DELAY_MS = 30000;
const COMMUNITY_CREATION_TIMEOUT_MS = 5 * 60 * 1000;
const COMMUNITY_METADATA_MAX_LOGICAL_ATTEMPTS = 11;
const COMMUNITY_WAIT_TIMEOUT_MS = 5 * 60 * 1000;
const METADATA_DEPLOYMENT_POLICY: MetadataDeploymentPolicy = {
  maxResumeAttempts: 5,
  overallTimeoutMs: 45 * 60 * 1000,
  retryDelayMs: 40000,
  waitMinutes: 10,
};
const COMMUNITY_EXPERIENCE_BUNDLE = 'Quantic_Examples1';
const COMMUNITY_READINESS_PROBLEMS = new Set([
  'In field: Network - no Network named Quantic Examples found',
  'The ExperienceBundle Definition Quantic_Examples1 does not exist',
]);
const TRANSIENT_COMMUNITY_CREATE_ERROR =
  'Error: Unable to create a new experience.';

export interface Options {
  ci: boolean;
  community: {
    name: string;
    path: string;
    template: string;
  };
  deleteOrgOnError: boolean;
  handoff?: ScratchOrgHandoffContext;
  jwt: SfdxJWTAuth;
  scratchOrg: {
    alias: string;
    defFile: string;
    duration: number;
    name: string;
  };
}

type CommunitySfdxCommands = Pick<
  typeof sfdx,
  | 'authorizeOrg'
  | 'createCommunity'
  | 'createScratchOrg'
  | 'deleteOrg'
  | 'deployCommunityMetadata'
  | 'deploySource'
  | 'getScratchOrg'
  | 'publishCommunity'
  | 'resumeMetadataDeployment'
>;

export interface DeploymentDependencies {
  metadataDeploymentPolicy: MetadataDeploymentPolicy;
  now: () => number;
  reportCleanupError: (error: unknown) => void;
  sfdx: CommunitySfdxCommands;
  sleep: (durationMs: number) => Promise<void>;
  waitForUrl: (url: string, timeoutMs: number) => Promise<void>;
  writeCommunityUrl: (communityUrl: string, orgName: string) => Promise<void>;
  writeScratchOrgHandoff: (
    context: ScratchOrgHandoffContext,
    handoff: ScratchOrgHandoff
  ) => Promise<void>;
  writeTelemetry: (line: string) => void;
}

function updateEnvFile(filePath: string, newVariables: Record<string, string>) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), {recursive: true});
      fs.writeFileSync(filePath, '', 'utf8');
    }

    const envData = fs.readFileSync(filePath, 'utf8');
    const lines = envData.split('\n');
    const envVariables: Record<string, string> = {};

    lines.forEach((line) => {
      const [key, value] = line.split('=');
      if (key) {
        envVariables[key.trim()] = value ? value.trim() : '';
      }
    });

    Object.keys(newVariables).forEach((key) => {
      envVariables[key] = newVariables[key];
    });

    const updatedEnvContent = Object.entries(envVariables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(filePath, updatedEnvContent, 'utf8');
    console.log('.env file updated successfully!');
  } catch (error) {
    console.error(`Error updating .env file: ${(error as Error).message}`);
  }
}

async function writeCommunityUrl(
  communityUrl: string,
  orgName: string
): Promise<void> {
  const envFilePath = path.join(
    __dirname,
    '..',
    '..',
    '.env',
    `${orgName}.env`
  );
  updateEnvFile(envFilePath, {[`${orgName}_URL`]: communityUrl});
}

const defaultDependencies: DeploymentDependencies = {
  metadataDeploymentPolicy: METADATA_DEPLOYMENT_POLICY,
  now: Date.now,
  reportCleanupError: (error) => console.error(error),
  sfdx,
  sleep: (durationMs) =>
    new Promise((resolve) => setTimeout(resolve, durationMs)),
  waitForUrl: async (url, timeoutMs) => {
    await waitOn({resources: [url], timeout: timeoutMs});
  },
  writeCommunityUrl,
  writeScratchOrgHandoff,
  writeTelemetry: console.log,
};

function ensureEnvironmentVariables(
  environment: NodeJS.ProcessEnv,
  variables: string[]
): void {
  variables.forEach((variable) => {
    if (!environment[variable]) {
      throw new Error(`The environment variable ${variable} must be defined.`);
    }
  });
}

function ensureEnvVariables(environment: NodeJS.ProcessEnv) {
  ensureEnvironmentVariables(environment, [
    'COMMIT_SHA',
    'SFDX_AUTH_CLIENT_ID',
    'SFDX_AUTH_JWT_KEY_FILE',
    'SFDX_AUTH_JWT_USERNAME',
    'GITHUB_REPOSITORY',
    'GITHUB_REPOSITORY_ID',
    'GITHUB_RUN_ATTEMPT',
    'GITHUB_RUN_ID',
    'GITHUB_SHA',
    'QUANTIC_LWS_STATUS',
    'RUNNER_TEMP',
  ]);
  if (environment.COMMIT_SHA !== environment.GITHUB_SHA) {
    throw new Error('COMMIT_SHA must match GITHUB_SHA.');
  }
}

function isCi(argv: string[]) {
  return argv.some((arg) => arg === '--ci');
}

function getLwsStatus(environment: NodeJS.ProcessEnv): LwsStatus {
  const lwsStatus = environment.QUANTIC_LWS_STATUS;
  if (lwsStatus !== 'enabled' && lwsStatus !== 'disabled') {
    throw new Error('QUANTIC_LWS_STATUS must be enabled or disabled.');
  }
  return lwsStatus;
}

export function getCiOrgName(
  repositoryId: string,
  runId: string,
  runAttempt: number,
  lwsStatus: LwsStatus
) {
  return buildScratchOrgName(repositoryId, runId, runAttempt, lwsStatus);
}

export function buildCiHandoffContext(
  orgAlias: string,
  environment: NodeJS.ProcessEnv
): ScratchOrgHandoffContext {
  ensureEnvironmentVariables(environment, [
    'COMMIT_SHA',
    'GITHUB_REPOSITORY',
    'GITHUB_REPOSITORY_ID',
    'GITHUB_RUN_ATTEMPT',
    'GITHUB_RUN_ID',
    'GITHUB_SHA',
    'QUANTIC_LWS_STATUS',
    'RUNNER_TEMP',
  ]);
  const lwsStatus = getLwsStatus(environment);
  if (orgAlias !== `Quantic__LWS_${lwsStatus}`) {
    throw new Error(
      'The scratch-org definition does not match QUANTIC_LWS_STATUS.'
    );
  }
  const runAttempt = Number(environment.GITHUB_RUN_ATTEMPT);
  if (
    !/^[1-9][0-9]*$/.test(environment.GITHUB_RUN_ID!) ||
    !Number.isSafeInteger(runAttempt) ||
    runAttempt < 1
  ) {
    throw new Error('The GitHub workflow run identity is invalid.');
  }
  if (!/^[^/\s]+\/[^/\s]+$/.test(environment.GITHUB_REPOSITORY!)) {
    throw new Error('The GitHub workflow repository is invalid.');
  }
  if (!/^[a-f0-9]{40}$/.test(environment.GITHUB_SHA!)) {
    throw new Error('The GitHub workflow commit SHA is invalid.');
  }
  if (environment.COMMIT_SHA !== environment.GITHUB_SHA) {
    throw new Error('COMMIT_SHA must match GITHUB_SHA.');
  }
  const context: ScratchOrgHandoffContext = {
    commitSha: environment.GITHUB_SHA!,
    lwsStatus,
    repository: environment.GITHUB_REPOSITORY!,
    repositoryId: environment.GITHUB_REPOSITORY_ID!,
    runAttempt,
    runId: environment.GITHUB_RUN_ID!,
    trustedRoot: environment.RUNNER_TEMP!,
  };
  buildScratchOrgIdentity(context);
  return context;
}

async function readDefinitionFile(file: string): Promise<object> {
  return JSON.parse(await fs.promises.readFile(file, 'utf8')) as object;
}

async function prepareScratchOrgDefinitionFile(
  baseDefinitionFile: string,
  ciOrgName?: string
): Promise<string> {
  if (!ciOrgName) {
    return baseDefinitionFile;
  }

  const ciDefinitionFile = path.resolve(
    path.dirname(baseDefinitionFile),
    'scratch-def.ci.json'
  );
  await fs.promises.writeFile(
    ciDefinitionFile,
    JSON.stringify(
      {
        ...(await readDefinitionFile(baseDefinitionFile)),
        orgName: ciOrgName,
      },
      null,
      2
    )
  );
  return ciDefinitionFile;
}

export async function buildDeploymentOptions(
  scratchOrgDefPath: string,
  argv: string[],
  environment: NodeJS.ProcessEnv = process.env
): Promise<Options> {
  const ci = isCi(argv);
  const orgName = getOrgNameFromScratchDefFile(scratchOrgDefPath);
  if (ci) {
    ensureEnvVariables(environment);
  }
  const handoff = ci ? buildCiHandoffContext(orgName, environment) : undefined;
  const ciIdentity = handoff ? buildScratchOrgIdentity(handoff) : undefined;
  const ciOrgName = ciIdentity?.orgName;

  return {
    ci,
    community: {
      name: 'Quantic Examples',
      path: 'examples',
      template: 'Build Your Own',
    },
    deleteOrgOnError: ci,
    handoff,
    jwt: {
      clientId: environment.SFDX_AUTH_CLIENT_ID!,
      keyFile: environment.SFDX_AUTH_JWT_KEY_FILE!,
      username: environment.SFDX_AUTH_JWT_USERNAME!,
    },
    scratchOrg: {
      alias: ciIdentity?.alias ?? orgName,
      defFile: await prepareScratchOrgDefinitionFile(
        path.resolve(scratchOrgDefPath),
        ciOrgName
      ),
      duration: ci ? 1 : 7,
      name: ciOrgName ?? orgName,
    },
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return '';
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

export function isCommunityMetadataReadinessFailure(error: unknown) {
  const root = asRecord(error);
  const result = asRecord(root?.result) ?? root;
  if (result?.status !== 'Failed' && result?.status !== 'FinalizingFailed') {
    return false;
  }

  const details = asRecord(result.details);
  const failuresValue = details?.componentFailures;
  const failures = (
    Array.isArray(failuresValue) ? failuresValue : [failuresValue]
  )
    .map(asRecord)
    .filter((failure): failure is Record<string, unknown> => !!failure);

  return (
    failures.length === 1 &&
    failures[0].componentType === 'ExperienceBundle' &&
    failures[0].fullName === COMMUNITY_EXPERIENCE_BUNDLE &&
    typeof failures[0].problem === 'string' &&
    COMMUNITY_READINESS_PROBLEMS.has(failures[0].problem)
  );
}

async function authorizeDevOrg(
  log: StepLogger,
  options: Options,
  dependencies: DeploymentDependencies
) {
  log(`Authorizing user: ${options.jwt.username}`);
  await dependencies.sfdx.authorizeOrg({
    username: options.jwt.username,
    isScratchOrg: false,
    jwtClientId: options.jwt.clientId,
    jwtKeyFile: options.jwt.keyFile,
  });
  log('Authorization successful');
}

async function ensureScratchOrgExists(
  log: StepLogger,
  options: Options,
  dependencies: DeploymentDependencies
): Promise<sfdx.SfdxOrg> {
  if (!options.ci) {
    log(`Searching for ${options.scratchOrg.alias} organization...`);
    const existingOrg = await dependencies.sfdx.getScratchOrg(
      options.scratchOrg.alias
    );
    if (existingOrg) {
      log(`${options.scratchOrg.alias} organization found.`);
      return existingOrg;
    }
  }

  log(`Creating ${options.scratchOrg.alias} organization...`);
  const createdOrg = await dependencies.sfdx.createScratchOrg(
    options.scratchOrg
  );
  if (!createdOrg.username || !createdOrg.orgId) {
    throw new Error(
      'Salesforce did not return the created scratch-org identity.'
    );
  }
  log('Organization created successfully.');
  return createdOrg;
}

async function updateScratchOrgHandoff(
  options: Options,
  username: string,
  orgId: string,
  phase: ScratchOrgHandoffPhase,
  communityUrl: string | null,
  dependencies: DeploymentDependencies
): Promise<void> {
  if (!options.handoff) {
    return;
  }
  await dependencies.writeScratchOrgHandoff(
    options.handoff,
    createScratchOrgHandoff(
      options.handoff,
      options.scratchOrg.alias,
      username,
      orgId,
      phase,
      communityUrl
    )
  );
}

async function ensureCommunityExists(
  log: StepLogger,
  options: Options,
  dependencies: DeploymentDependencies
): Promise<void> {
  log(`Searching for '${options.community.name}' community`);
  const deadline = dependencies.now() + COMMUNITY_CREATION_TIMEOUT_MS;

  for (let attempt = 1; attempt <= COMMUNITY_CREATION_MAX_ATTEMPTS; attempt++) {
    try {
      await dependencies.sfdx.createCommunity({
        alias: options.scratchOrg.alias,
        community: options.community,
      });
      log('Community created successfully.');
      return;
    } catch (error) {
      const message = getErrorMessage(error);
      if (message === 'Enter a different name. That one already exists.') {
        log('Community found.');
        return;
      }
      if (message !== TRANSIENT_COMMUNITY_CREATE_ERROR) {
        throw error;
      }
      if (
        attempt >= COMMUNITY_CREATION_MAX_ATTEMPTS ||
        dependencies.now() + COMMUNITY_CREATION_RETRY_DELAY_MS >= deadline
      ) {
        throw error;
      }

      log(
        'Community creation failed because the org domain is not ready yet. Retrying...'
      );
      await dependencies.sleep(COMMUNITY_CREATION_RETRY_DELAY_MS);
    }
  }
}

async function deployComponents(
  log: StepLogger,
  options: Options,
  dependencies: DeploymentDependencies
): Promise<void> {
  log('Deploying components...');
  await runMetadataDeployment({
    dependencies: {
      log,
      now: dependencies.now,
      resume: async (deploymentId, waitMinutes, executionTimeoutMs) =>
        dependencies.sfdx.resumeMetadataDeployment({
          deploymentId,
          executionTimeoutMs,
          waitMinutes,
        }),
      sleep: dependencies.sleep,
      start: async (executionTimeoutMs) =>
        dependencies.sfdx.deploySource({
          alias: options.scratchOrg.alias,
          executionTimeoutMs,
          packagePaths: [
            'force-app/main',
            'force-app/examples',
            'force-app/solutionExamples',
          ],
        }),
    },
    policy: dependencies.metadataDeploymentPolicy,
    step: 'source_deployment',
  });
  log('Components deployed.');
}

async function deployCommunityMetadata(
  log: StepLogger,
  options: Options,
  dependencies: DeploymentDependencies
): Promise<void> {
  log('Deploying community metadata...');
  await runMetadataDeployment({
    dependencies: {
      log,
      now: dependencies.now,
      resume: async (deploymentId, waitMinutes, executionTimeoutMs) =>
        dependencies.sfdx.resumeMetadataDeployment({
          deploymentId,
          executionTimeoutMs,
          waitMinutes,
        }),
      sleep: dependencies.sleep,
      start: async (executionTimeoutMs) =>
        dependencies.sfdx.deployCommunityMetadata({
          alias: options.scratchOrg.alias,
          communityMetadataPath: 'quantic-examples-community',
          executionTimeoutMs,
        }),
    },
    isRetryableTerminalFailure: isCommunityMetadataReadinessFailure,
    maxLogicalAttempts: COMMUNITY_METADATA_MAX_LOGICAL_ATTEMPTS,
    policy: dependencies.metadataDeploymentPolicy,
    step: 'community_metadata_deployment',
  });
  log('Community metadata deployed.');
}

async function publishCommunity(
  log: StepLogger,
  options: Options,
  dependencies: DeploymentDependencies
): Promise<string> {
  log('Publishing community...');
  const response = await dependencies.sfdx.publishCommunity({
    alias: options.scratchOrg.alias,
    communityName: options.community.name,
  });
  log('Community published.');
  return response.result.url;
}

async function waitForCommunity(
  log: StepLogger,
  communityUrl: string,
  dependencies: DeploymentDependencies
): Promise<void> {
  log(`Waiting for community at URL: ${communityUrl} ...`);
  await dependencies.waitForUrl(communityUrl, COMMUNITY_WAIT_TIMEOUT_MS);
  log('Community is now available');
}

async function deleteScratchOrg(
  log: StepLogger,
  options: Options,
  username: string,
  dependencies: DeploymentDependencies
): Promise<void> {
  log(`Deleting ${options.scratchOrg.alias} organization...`);
  await dependencies.sfdx.deleteOrg(username);
  log('Organization deleted successfully.');
}

export async function runCommunityDeployment(
  options: Options,
  orgName: string,
  dependencies: DeploymentDependencies = defaultDependencies
): Promise<string> {
  let communityUrl = '';
  let scratchOrgAvailable = false;
  let scratchOrgId = '';
  let scratchOrgUsername = '';
  const runner = new StepsRunner();
  const telemetry = new DeploymentTelemetry(
    dependencies.writeTelemetry,
    dependencies.now
  );

  try {
    if (options.ci) {
      runner.add(async (log) =>
        telemetry.measure('authorization', () =>
          authorizeDevOrg(log, options, dependencies)
        )
      );
    }
    runner
      .add(async (log) =>
        telemetry.measure('scratch_org_creation', async () => {
          const scratchOrg = await ensureScratchOrgExists(
            log,
            options,
            dependencies
          );
          scratchOrgId = scratchOrg.orgId ?? '';
          scratchOrgUsername = scratchOrg.username;
          scratchOrgAvailable = true;
          await updateScratchOrgHandoff(
            options,
            scratchOrgUsername,
            scratchOrgId,
            'provisioned',
            null,
            dependencies
          );
        })
      )
      .add(async (log) =>
        telemetry.measure('community_creation', () =>
          ensureCommunityExists(log, options, dependencies)
        )
      )
      .add(async (log) =>
        telemetry.measure('source_deployment', () =>
          deployComponents(log, options, dependencies)
        )
      )
      .add(async (log) =>
        telemetry.measure('community_metadata_deployment', () =>
          deployCommunityMetadata(log, options, dependencies)
        )
      )
      .add(async (log) =>
        telemetry.measure('publication', async () => {
          communityUrl = await publishCommunity(log, options, dependencies);
          await updateScratchOrgHandoff(
            options,
            scratchOrgUsername,
            scratchOrgId,
            'published',
            communityUrl,
            dependencies
          );
        })
      )
      .add(async () => {
        await dependencies.writeCommunityUrl(communityUrl, orgName);
      })
      .add(async (log) =>
        telemetry.measure('availability_checks', async () => {
          await waitForCommunity(log, communityUrl, dependencies);
          await updateScratchOrgHandoff(
            options,
            scratchOrgUsername,
            scratchOrgId,
            'ready',
            communityUrl,
            dependencies
          );
        })
      );

    await runner.run();
    return communityUrl;
  } catch (error) {
    if (options.deleteOrgOnError && scratchOrgAvailable) {
      try {
        await deleteScratchOrg(
          runner.getLogger(),
          options,
          scratchOrgUsername,
          dependencies
        );
        try {
          await updateScratchOrgHandoff(
            options,
            scratchOrgUsername,
            scratchOrgId,
            'deleted',
            communityUrl || null,
            dependencies
          );
        } catch (handoffError) {
          dependencies.reportCleanupError(handoffError);
        }
      } catch (cleanupError) {
        dependencies.reportCleanupError(cleanupError);
      }
    }
    throw error;
  }
}

export async function main(argv: string[] = process.argv): Promise<void> {
  dotenv.config({path: path.resolve(__dirname, '.env')});
  const scratchOrgDefPath = getScratchOrgDefPath(argv);
  const orgName = getOrgNameFromScratchDefFile(scratchOrgDefPath);
  const options = await buildDeploymentOptions(
    scratchOrgDefPath,
    argv,
    process.env
  );
  const communityUrl = await runCommunityDeployment(options, orgName);

  console.log(
    `\nThe '${options.community.name}' community is ready, you can access it at the following URL:`
  );
  console.log(communityUrl);
}

if (require.main === module) {
  void main().catch((error) => {
    console.error('Failed to complete');
    console.error(error);
    process.exitCode = 1;
  });
}
