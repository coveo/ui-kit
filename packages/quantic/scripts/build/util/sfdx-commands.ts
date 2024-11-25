import {sfdx, SfdxResponse} from './sfdx';

export interface SfdxOrg {
  alias?: string;
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

export interface SfdxActiveScratchOrgsResponse extends SfdxResponse {
  result: {
    records: {
      SignupUsername: string;
    }[];
  };
}

export interface SfdxOldScratchOrgsResponse extends SfdxResponse {
  result: {
    records: {
      SignupUsername: string;
      CreatedDate: string;
    }[];
  };
}

export interface SfdxCreateOrgResponse extends SfdxResponse {
  result: SfdxOrg;
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

export async function getActiveScratchOrgUsernames(
  devHubAlias: string,
  scratchOrgName: string
): Promise<string[]> {
  const response = await sfdx<SfdxActiveScratchOrgsResponse>(
    `data query --target-org ${devHubAlias} --query "SELECT SignupUsername FROM ScratchOrgInfo WHERE OrgName='${scratchOrgName}' AND Status != 'Deleted'"`
  );

  return response.result.records.map((r) => r.SignupUsername);
}

export async function getOldScratchOrgUsernames(
  devHubAlias: string,
  scratchOrgName: string
): Promise<string[]> {
  const response = await sfdx<SfdxOldScratchOrgsResponse>(
    `data query --target-org ${devHubAlias} --query "SELECT SignupUsername, CreatedDate FROM ScratchOrgInfo WHERE OrgName='${scratchOrgName}' AND Status != 'Deleted'"`
  );

  const ageThresholdMsec = 2 * 60 * 60 * 1000;
  const isOldOrg = (createdDateString: string) => {
    const created = new Date(createdDateString).getTime();
    const now = new Date(Date.now()).getTime();
    return now - created > ageThresholdMsec;
  };

  return response.result.records
    .filter((r) => isOldOrg(r.CreatedDate))
    .map((r) => r.SignupUsername);
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

export async function createScratchOrg(args: CreateScratchOrgArguments) {
  await sfdx(
    `org create scratch --set-default --definition-file "${args.defFile}" --alias ${args.alias} --duration-days ${args.duration}`
  );
}

interface DeleteActiveScratchOrgsArguments {
  devHubUsername: string;
  scratchOrgName: string;
  jwtClientId: string;
  jwtKeyFile: string;
}

export async function deleteActiveScratchOrgs(
  args: DeleteActiveScratchOrgsArguments
): Promise<void> {
  const usernames = await getActiveScratchOrgUsernames(
    args.devHubUsername,
    args.scratchOrgName
  );

  for (const username of usernames) {
    try {
      await authorizeOrg({
        username,
        isScratchOrg: true,
        jwtClientId: args.jwtClientId,
        jwtKeyFile: args.jwtKeyFile,
      });
      await deleteOrg(username);
    } catch (error) {
      console.warn(`Failed to delete organization ${username}`);
      console.warn(JSON.stringify(error));
    }
  }
}

interface DeleteOldScratchOrgsArguments {
  devHubUsername: string;
  scratchOrgName: string;
  jwtClientId: string;
  jwtKeyFile: string;
}

export async function deleteOldScratchOrgs(
  args: DeleteOldScratchOrgsArguments
): Promise<number> {
  const usernames = await getOldScratchOrgUsernames(
    args.devHubUsername,
    args.scratchOrgName
  );

  let nbDeletedOrgs = 0;
  for (const username of usernames) {
    try {
      await authorizeOrg({
        username,
        isScratchOrg: true,
        jwtClientId: args.jwtClientId,
        jwtKeyFile: args.jwtKeyFile,
      });
      await deleteOrg(username);
      nbDeletedOrgs += 1;
    } catch (error) {
      console.warn(`Failed to delete organization ${username}`);
      console.warn(JSON.stringify(error));
    }
  }

  return nbDeletedOrgs;
}

export async function orgExists(alias: string): Promise<boolean> {
  const response = await sfdx<SfdxListOrgsResponse>('org list');

  const org = response.result.scratchOrgs.find((o) => o.alias === alias);

  const isOrgFound = !!org;
  const isOrgActive = isOrgFound && org.status === 'Active';

  if (isOrgFound && !isOrgActive) {
    console.warn(
      `Org ${alias} is found but status is not active. Status is ${org.status}.`
    );
  }

  return isOrgActive;
}

export async function deleteOrg(alias: string): Promise<void> {
  await sfdx(`org delete scratch --target-org ${alias} --no-prompt`);
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
  packagePaths: string[];
}

export async function deploySource(args: DeploySourceArguments): Promise<void> {
  const sourceDirs = args.packagePaths
    .map((p) => `--source-dir "${p}"`)
    .join(' ');

  await sfdx(
    `project deploy start --ignore-conflicts --target-org ${args.alias} ${sourceDirs}`
  );
}

export interface DeployCommunityMetadataArguments {
  alias: string;
  communityMetadataPath: string;
  timeout: number;
}

export async function deployCommunityMetadata(
  args: DeployCommunityMetadataArguments
): Promise<void> {
  await sfdx(
    `project deploy start --target-org ${args.alias} --ignore-conflicts --metadata-dir "${args.communityMetadataPath}" --wait ${args.timeout}`
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
