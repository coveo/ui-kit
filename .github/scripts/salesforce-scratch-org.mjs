import {execFileSync} from 'node:child_process';

const SALESFORCE_ID = /^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$/;
const SCRATCH_ORG_ID = /^00D[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?$/;
const SCRATCH_ORG_INFO_ID = /^2SR[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?$/;
const USERNAME = /^[A-Za-z0-9][A-Za-z0-9._+%=-]*@[A-Za-z0-9][A-Za-z0-9.-]*$/;
const ORG_NAME = /^q-r[1-9a-z][0-9a-z]{0,12}-w[1-9a-z][0-9a-z]{0,12}-a[1-9a-z][0-9a-z]{0,10}-[ed]$/;

export const SALESFORCE_ORG_NAME_MAX_LENGTH = 80;
export const SCRATCH_ORG_STATUSES = ['New', 'Creating', 'Active', 'Error', 'Deleted'];

function fail(message) {
  throw new Error(message);
}

export function assertSalesforceUsername(username) {
  if (
    typeof username !== 'string' ||
    username.length > 320 ||
    !USERNAME.test(username) ||
    username.includes('..')
  ) {
    fail('The Salesforce username is invalid.');
  }
}

export function assertScratchOrgId(orgId) {
  if (typeof orgId !== 'string' || !SCRATCH_ORG_ID.test(orgId)) {
    fail('The Salesforce scratch-org ID is invalid.');
  }
}

export function assertScratchOrgInfoId(scratchOrgInfoId) {
  if (typeof scratchOrgInfoId !== 'string' || !SCRATCH_ORG_INFO_ID.test(scratchOrgInfoId)) {
    fail('The Salesforce ScratchOrgInfo ID is invalid.');
  }
}

function assertSalesforceId(value) {
  if (typeof value !== 'string' || !SALESFORCE_ID.test(value)) {
    fail('A Salesforce ID is invalid.');
  }
}

export function assertOrgName(orgName) {
  if (
    typeof orgName !== 'string' ||
    orgName.length > SALESFORCE_ORG_NAME_MAX_LENGTH ||
    !ORG_NAME.test(orgName)
  ) {
    fail('The deterministic scratch-org name is invalid.');
  }
}

function sfExecutable(options) {
  return options.sfExecutable ?? process.env.QUANTIC_SF_EXECUTABLE ?? 'sf';
}

export function runSfJson(args, options = {}) {
  let source;
  try {
    source = (options.execFileSync ?? execFileSync)(sfExecutable(options), [...args, '--json'], {
      encoding: 'utf8',
      env: process.env,
      maxBuffer: 2 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 2 * 60 * 1000,
    });
  } catch {
    fail('The Salesforce CLI command failed.');
  }

  let response;
  try {
    response = JSON.parse(source);
  } catch {
    fail('The Salesforce CLI returned invalid JSON.');
  }
  if (
    typeof response !== 'object' ||
    response === null ||
    response.status !== 0 ||
    typeof response.result !== 'object' ||
    response.result === null
  ) {
    fail('The Salesforce CLI returned an unsuccessful response.');
  }
  return response.result;
}

export function createScratchOrg({alias, definitionFile, durationDays}, options = {}) {
  if (
    !/^q_r[1-9a-z][0-9a-z]{0,12}_w[1-9a-z][0-9a-z]{0,12}_a[1-9a-z][0-9a-z]{0,10}_[ed]$/.test(alias)
  ) {
    fail('The scratch-org alias is invalid.');
  }
  if (typeof definitionFile !== 'string' || definitionFile.length === 0) {
    fail('The scratch-org definition path is invalid.');
  }
  if (!Number.isSafeInteger(durationDays) || durationDays < 1) {
    fail('The scratch-org duration is invalid.');
  }
  const result = runSfJson(
    [
      'org',
      'create',
      'scratch',
      '--set-default',
      '--definition-file',
      definitionFile,
      '--alias',
      alias,
      '--duration-days',
      String(durationDays),
    ],
    options
  );
  assertSalesforceUsername(result.username);
  assertScratchOrgId(result.orgId);
  return {orgId: result.orgId, username: result.username};
}

export function queryScratchOrgsByName({devHubUsername, orgName}, options = {}) {
  assertSalesforceUsername(devHubUsername);
  assertOrgName(orgName);
  const query =
    `SELECT Id, ScratchOrg, SignupUsername, OrgName, Status FROM ScratchOrgInfo ` +
    `WHERE OrgName = '${orgName}'`;
  const result = runSfJson(
    ['data', 'query', '--target-org', devHubUsername, '--query', query],
    options
  );
  if (!Array.isArray(result.records) || result.records.length > 1) {
    fail('The Salesforce ScratchOrgInfo query result is invalid.');
  }
  return result.records.map((record) => {
    if (
      typeof record !== 'object' ||
      record === null ||
      record.OrgName !== orgName ||
      !SCRATCH_ORG_STATUSES.includes(record.Status)
    ) {
      fail('The Salesforce ScratchOrgInfo record is invalid.');
    }
    assertScratchOrgInfoId(record.Id);
    const orgId = record.ScratchOrg ?? null;
    const username = record.SignupUsername ?? null;
    if (orgId !== null) {
      assertScratchOrgId(orgId);
    }
    if (username !== null) {
      assertSalesforceUsername(username);
    }
    if (record.Status === 'Active' && (orgId === null || username === null)) {
      fail('The active Salesforce ScratchOrgInfo identity is incomplete.');
    }
    return {
      scratchOrgInfoId: record.Id,
      orgId,
      orgName: record.OrgName,
      status: record.Status,
      username,
    };
  });
}

export function loginScratchOrgJwt({clientId, jwtKeyFile, username}, options = {}) {
  assertSalesforceUsername(username);
  if (typeof clientId !== 'string' || clientId.length === 0) {
    fail('The Salesforce client ID is invalid.');
  }
  if (typeof jwtKeyFile !== 'string' || jwtKeyFile.length === 0) {
    fail('The Salesforce JWT key path is invalid.');
  }
  runSfJson(
    [
      'org',
      'login',
      'jwt',
      '--client-id',
      clientId,
      '--jwt-key-file',
      jwtKeyFile,
      '--username',
      username,
      '--instance-url',
      'https://test.salesforce.com',
      '--set-default',
    ],
    options
  );
}

export function deleteScratchOrg({username}, options = {}) {
  assertSalesforceUsername(username);
  runSfJson(['org', 'delete', 'scratch', '--target-org', username, '--no-prompt'], options);
}

export function assertAuthoritativeScratchOrg(value) {
  if (typeof value !== 'object' || value === null || value.status !== 'Active') {
    fail('The authoritative scratch-org identity is invalid.');
  }
  assertScratchOrgInfoId(value.scratchOrgInfoId);
  assertScratchOrgId(value.orgId);
  assertOrgName(value.orgName);
  assertSalesforceUsername(value.username);
  assertSalesforceId(value.orgId);
}
