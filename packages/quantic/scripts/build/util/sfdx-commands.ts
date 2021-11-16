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
    `force:data:soql:query -u ${devHubAlias} -q "SELECT SignupUsername FROM ScratchOrgInfo WHERE OrgName='${scratchOrgName}' AND Status != 'Deleted'"`
  );

  return response.result.records.map((r) => r.SignupUsername);
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
    `force:auth:jwt:grant --clientid ${args.jwtClientId} --jwtkeyfile "${args.jwtKeyFile}" --username ${args.username} --instanceurl ${instanceUrl}`
  );
}

export interface CreateScratchOrgArguments {
  defFile: string;
  alias: string;
  duration: number;
}

export async function createScratchOrg(args: CreateScratchOrgArguments) {
  await sfdx(
    `force:org:create -s -f "${args.defFile}" -a ${args.alias} -t scratch -d ${args.duration}`
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

export async function orgExists(alias: string): Promise<boolean> {
  const response = await sfdx<SfdxListOrgsResponse>('force:org:list');

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
  await sfdx(`force:org:delete -u ${alias} --noprompt`);
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
    `force:community:create -u ${args.alias} -n "${args.community.name}" -p "${args.community.path}" -t "${args.community.template}"`
  );
}

export interface DeploySourceArguments {
  alias: string;
  packagePaths: string[];
}

export async function deploySource(args: DeploySourceArguments): Promise<void> {
  const paths = args.packagePaths.map((p) => `"${p}"`).join(',');

  await sfdx(`force:source:deploy -u ${args.alias} -p ${paths}`);
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
    `force:mdapi:deploy -u ${args.alias} -d "${args.communityMetadataPath}" -w ${args.timeout}`
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
    `force:community:publish -u ${args.alias} -n "${args.communityName}"`
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
    `sfdx force:package:version:create --package ${args.packageId} --versionnumber "${args.packageVersion}" --installationkeybypass --codecoverage --wait ${args.timeout}`
  );
}

export interface PromotePackageVersionArguments {
  packageVersionId: string;
}

export async function promotePackageVersion(
  args: PromotePackageVersionArguments
) {
  return await sfdx(
    `sfdx force:package:version:promote --package ${args.packageVersionId}`
  );
}

export async function getPackageVersionList(): Promise<SfdxGetPackageListResponse> {
  return await sfdx<SfdxGetPackageListResponse>(
    'sfdx force:package:version:list'
  );
}
