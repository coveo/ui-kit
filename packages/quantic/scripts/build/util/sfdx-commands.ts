import {isSalesforceDeploymentId, sfdx, sfCommand} from './sfdx';
import type {SfdxResponse} from './sfdx';

const SCRATCH_ORG_COMMAND_TIMEOUT_MS = 10 * 60 * 1000;

export type SfJsonCommandRunner = <T>(
  args: readonly string[],
  timeoutMs: number
) => Promise<T>;

const defaultSfJsonCommandRunner: SfJsonCommandRunner = (args, timeoutMs) =>
  sfCommand(args, timeoutMs);

export interface SfdxOrg {
  alias?: string;
  orgId?: string;
  username: string;
  status: string;
}

export interface SfdxJWTAuth {
  clientId: string;
  keyFile: string;
  username: string;
}

export interface SfdxListOrgsResponse extends SfdxResponse {
  result: {
    nonScratchOrgs: Array<SfdxOrg>;
    scratchOrgs: Array<SfdxOrg>;
  };
}

export interface SfdxCreateOrgResponse extends SfdxResponse {
  result: {
    alias?: string;
    orgId: string;
    status?: string;
    username: string;
  };
}

export interface SfdxPublishCommunityResponse extends SfdxResponse {
  result: {
    url: string;
  };
}

export interface SfdxCreatePackageVersionResponse extends SfdxResponse {
  result: {
    Id: string;
    Status: string;
    Package2Id: string;
    Package2VersionId: string;
    SubscriberPackageVersionId: string;
    Tag?: string;
    Branch?: string;
    Error: string[];
    CreatedDate: string;
    HasMetadataRemoved: boolean;
  };
}

export interface SfdxPackageDetails {
  Package2Id: string;
  Branch?: string;
  Tag?: string;
  MajorVersion: number;
  MinorVersion: number;
  PatchVersion: number;
  BuildNumber: number;
  Id: string;
  SubscriberPackageVersionId: string;
  Name: string;
  NamespacePrefix?: string;
  Package2Name: string;
  Description: string;
  Version: string;
  IsPasswordProtected: boolean;
  IsReleased: boolean;
  CreatedDate: string;
  LastModifiedDate: string;
  InstallUrl: string;
  CodeCoverage: string;
  ValidationSkipped: boolean;
  AncestorId: string;
  AncestorVersion: string;
  Alias: string;
  IsOrgDependent: string;
  ReleaseVersion: string;
  BuildDurationInSeconds: string;
  HasMetadataRemoved: string;
}

export interface SfdxGetPackageListResponse extends SfdxResponse {
  result: SfdxPackageDetails[];
}

export interface AuthorizeOrgArguments {
  username: string;
  isScratchOrg: boolean;
  jwtClientId: string;
  jwtKeyFile: string;
}

export async function authorizeOrg(args: AuthorizeOrgArguments) {
  const instanceUrl = `https://${
    args.isScratchOrg ? 'test' : 'login'
  }.salesforce.com`;
  await sfdx(
    `org login jwt --client-id ${args.jwtClientId} --jwt-key-file "${args.jwtKeyFile}" --username ${args.username} --instance-url ${instanceUrl} --set-default-dev-hub`
  );
}

export interface CreateScratchOrgArguments {
  defFile: string;
  alias: string;
  duration: number;
}

export async function createScratchOrg(
  args: CreateScratchOrgArguments,
  runSfCommand: SfJsonCommandRunner = defaultSfJsonCommandRunner
): Promise<SfdxOrg> {
  const response = await runSfCommand<SfdxCreateOrgResponse>(
    [
      'org',
      'create',
      'scratch',
      '--set-default',
      '--definition-file',
      args.defFile,
      '--alias',
      args.alias,
      '--duration-days',
      String(args.duration),
    ],
    SCRATCH_ORG_COMMAND_TIMEOUT_MS
  );
  if (!response.result.username || !response.result.orgId) {
    throw new Error(
      'Salesforce did not return the created scratch-org identity.'
    );
  }
  return {
    alias: response.result.alias ?? args.alias,
    orgId: response.result.orgId,
    status: response.result.status ?? 'Active',
    username: response.result.username,
  };
}

export async function getScratchOrg(
  alias: string
): Promise<SfdxOrg | undefined> {
  const response = await sfdx<SfdxListOrgsResponse>('org list');

  const org = response.result.scratchOrgs.find((o) => o.alias === alias);
  if (org && org.status !== 'Active') {
    console.warn(
      `Org ${alias} is found but status is not active. Status is ${org.status}.`
    );
  }
  return org?.status === 'Active' ? org : undefined;
}

export async function deleteOrg(
  targetOrg: string,
  runSfCommand: SfJsonCommandRunner = defaultSfJsonCommandRunner
): Promise<void> {
  if (!/^[A-Za-z0-9._+%@=-]+$/.test(targetOrg)) {
    throw new Error('The scratch-org deletion target is invalid.');
  }
  await runSfCommand(
    ['org', 'delete', 'scratch', '--target-org', targetOrg, '--no-prompt'],
    SCRATCH_ORG_COMMAND_TIMEOUT_MS
  );
}

export interface CreateCommunityArguments {
  alias: string;
  community: {
    name: string;
    path: string;
    template: string;
  };
}

export async function createCommunity(
  args: CreateCommunityArguments
): Promise<void> {
  await sfdx(
    `community create --target-org ${args.alias} --name "${args.community.name}" --url-path-prefix "${args.community.path}" --template-name "${args.community.template}"`
  );
}

export interface DeploySourceArguments {
  alias: string;
  executionTimeoutMs: number;
  packagePaths: string[];
}

export interface SfdxMetadataDeployResponse extends SfdxResponse {
  result: {
    details?: unknown;
    done?: boolean;
    id?: string;
    status?: string;
    success?: boolean;
  };
}

export async function deploySource(
  args: DeploySourceArguments
): Promise<SfdxMetadataDeployResponse> {
  return sfCommand<SfdxMetadataDeployResponse>(
    [
      'project',
      'deploy',
      'start',
      '--async',
      '--ignore-conflicts',
      '--target-org',
      args.alias,
      ...args.packagePaths.flatMap((packagePath) => [
        '--source-dir',
        packagePath,
      ]),
    ],
    args.executionTimeoutMs
  );
}

export interface DeployCommunityMetadataArguments {
  alias: string;
  communityMetadataPath: string;
  executionTimeoutMs: number;
}

export async function deployCommunityMetadata(
  args: DeployCommunityMetadataArguments
): Promise<SfdxMetadataDeployResponse> {
  return sfCommand<SfdxMetadataDeployResponse>(
    [
      'project',
      'deploy',
      'start',
      '--async',
      '--target-org',
      args.alias,
      '--ignore-conflicts',
      '--metadata-dir',
      args.communityMetadataPath,
    ],
    args.executionTimeoutMs
  );
}

export interface ResumeMetadataDeploymentArguments {
  deploymentId: string;
  executionTimeoutMs: number;
  waitMinutes: number;
}

export async function resumeMetadataDeployment(
  args: ResumeMetadataDeploymentArguments
): Promise<SfdxMetadataDeployResponse> {
  if (!isSalesforceDeploymentId(args.deploymentId)) {
    throw new Error('The Salesforce metadata deployment ID is invalid.');
  }
  if (!Number.isInteger(args.waitMinutes) || args.waitMinutes < 1) {
    throw new Error('The Salesforce metadata deployment wait is invalid.');
  }

  return sfCommand<SfdxMetadataDeployResponse>(
    [
      'project',
      'deploy',
      'resume',
      '--job-id',
      args.deploymentId,
      '--wait',
      String(args.waitMinutes),
    ],
    args.executionTimeoutMs
  );
}

export interface PublishCommunityArguments {
  alias: string;
  communityName: string;
}

export async function publishCommunity(
  args: PublishCommunityArguments
): Promise<SfdxPublishCommunityResponse> {
  return await sfdx<SfdxPublishCommunityResponse>(
    `community publish --target-org ${args.alias} --name "${args.communityName}"`
  );
}

export async function setAlias(alias: string, value: string) {
  await sfdx(`alias:set ${alias}="${value}"`);
}

export interface CreatePackageVersionArguments {
  packageId: string;
  packageVersion: string;
  timeout: number;
}

export async function createPackageVersion(
  args: CreatePackageVersionArguments
): Promise<SfdxCreatePackageVersionResponse> {
  return await sfdx<SfdxCreatePackageVersionResponse>(
    `package version create --package ${args.packageId} --version-number "${args.packageVersion}" --installation-key-bypass --code-coverage --wait ${args.timeout}`
  );
}

export interface PromotePackageVersionArguments {
  packageVersionId: string;
}

export async function promotePackageVersion(
  args: PromotePackageVersionArguments
) {
  return await sfdx(
    `package version promote --package ${args.packageVersionId} --no-prompt`
  );
}

export async function getPackageVersionList(
  createdLastDays: number
): Promise<SfdxGetPackageListResponse> {
  return await sfdx<SfdxGetPackageListResponse>(
    `package version list --created-last-days ${createdLastDays}`
  );
}
