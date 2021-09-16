import {exec} from 'child_process';
// eslint-disable-next-line node/no-unpublished-import
import strip from 'strip-color';
import * as path from 'path';

/**
 * A response from a successful sfdx command.
 */
export interface SfdxResponse {
  status: number;
  result: object;
}

export interface SfdxOrg {
  alias?: string;
  username: string;
  status: string;
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

/**
 * Executes the given sfdx function and returns the result as an object.
 * @param command The command to be executed, starting with force:.
 * @returns {SfdxResponse} The result of the command, if successful.
 * @throws {Error} The error thrown by the sfdx command if unsuccessful.
 */
export function sfdx<T = SfdxResponse>(command: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    exec(
      `"${path.resolve('node_modules/.bin/sfdx')}" ${command} --json`,
      {
        cwd: process.cwd(),
        env: process.env,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout) => {
        (error ? reject : resolve)(
          stdout ? (JSON.parse(strip(stdout)) as T) : null
        );
      }
    );
  });
}

async function getActiveScratchOrgUsernames(
  devHubAlias: string,
  scratchOrgName: string
): Promise<string[]> {
  const response = await sfdx<SfdxActiveScratchOrgsResponse>(
    `force:data:soql:query -u ${devHubAlias} -q "SELECT SignupUsername FROM ScratchOrgInfo WHERE OrgName='${scratchOrgName}' AND Status != 'Deleted'"`
  );

  return response.result.records.map((r) => r.SignupUsername);
}

async function authorizeScratchOrg(
  username: string,
  jwtClientId: string,
  jwtKeyFile: string
) {
  sfdx(
    `force:auth:jwt:grant --clientid ${jwtClientId} --jwtkeyfile ${jwtKeyFile} --username ${username} --instanceurl https://test.salesforce.com`
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
      await authorizeScratchOrg(username, args.jwtClientId, args.jwtKeyFile);
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
