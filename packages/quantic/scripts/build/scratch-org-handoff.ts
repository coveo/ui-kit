import * as fs from 'node:fs';
import * as path from 'node:path';

export type ScratchOrgHandoffPhase =
  'provisioned' | 'published' | 'ready' | 'deleted';
export type LwsStatus = 'enabled' | 'disabled';

export interface ScratchOrgHandoffContext {
  commitSha: string;
  lwsStatus: LwsStatus;
  repository: string;
  repositoryId: string;
  runAttempt: number;
  runId: string;
  trustedRoot: string;
}

export interface ScratchOrgIdentity {
  alias: string;
  artifactDirectory: string;
  artifactName: string;
  artifactRoot: string;
  handoffFile: string;
  orgName: string;
}

export interface ScratchOrgHandoff {
  schemaVersion: 3;
  runId: string;
  runAttempt: number;
  repository: string;
  repositoryId: string;
  commitSha: string;
  lwsStatus: LwsStatus;
  alias: string;
  username: string;
  orgId: string;
  phase: ScratchOrgHandoffPhase;
  communityUrl: string | null;
}

export interface ScratchOrgHandoffWriterDependencies {
  rename: (source: string, destination: string) => Promise<void>;
}

const defaultWriterDependencies: ScratchOrgHandoffWriterDependencies = {
  rename: fs.promises.rename,
};

export const SALESFORCE_ORG_NAME_MAX_LENGTH = 80;
const MAX_GITHUB_ID = '18446744073709551615';
const BASE_36_DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

function validateGithubId(value: string, label: string): void {
  if (
    !/^[1-9][0-9]*$/.test(value) ||
    value.length > MAX_GITHUB_ID.length ||
    (value.length === MAX_GITHUB_ID.length && value > MAX_GITHUB_ID)
  ) {
    throw new Error(`The GitHub ${label} is invalid.`);
  }
}

function encodeDecimalId(value: string, label: string): string {
  validateGithubId(value, label);
  let decimal = value;
  let encoded = '';
  while (decimal !== '0') {
    let quotient = '';
    let remainder = 0;
    for (const digit of decimal) {
      const dividend = remainder * 10 + Number(digit);
      const quotientDigit = Math.floor(dividend / 36);
      remainder = dividend % 36;
      if (quotient || quotientDigit !== 0) {
        quotient += String(quotientDigit);
      }
    }
    encoded = `${BASE_36_DIGITS[remainder]}${encoded}`;
    decimal = quotient || '0';
  }
  return encoded;
}

function validateContext(context: ScratchOrgHandoffContext): void {
  validateGithubId(context.repositoryId, 'repository ID');
  validateGithubId(context.runId, 'workflow run ID');
  if (!Number.isSafeInteger(context.runAttempt) || context.runAttempt < 1) {
    throw new Error('The workflow run attempt is invalid.');
  }
  if (context.lwsStatus !== 'enabled' && context.lwsStatus !== 'disabled') {
    throw new Error('The LWS status is invalid.');
  }
  if (!/^[^/\s]+\/[^/\s]+$/.test(context.repository)) {
    throw new Error('The workflow repository is invalid.');
  }
  if (!/^[a-f0-9]{40}$/.test(context.commitSha)) {
    throw new Error('The workflow commit SHA is invalid.');
  }
  if (
    !path.isAbsolute(context.trustedRoot) ||
    path.resolve(context.trustedRoot) !== context.trustedRoot ||
    context.trustedRoot.split(path.sep).includes('..')
  ) {
    throw new Error('The trusted artifact root is invalid.');
  }
}

export function buildScratchOrgName(
  repositoryId: string,
  runId: string,
  runAttempt: number,
  lwsStatus: LwsStatus
): string {
  const encodedRepositoryId = encodeDecimalId(repositoryId, 'repository ID');
  const encodedRunId = encodeDecimalId(runId, 'workflow run ID');
  if (!Number.isSafeInteger(runAttempt) || runAttempt < 1) {
    throw new Error('The workflow run attempt is invalid.');
  }
  if (lwsStatus !== 'enabled' && lwsStatus !== 'disabled') {
    throw new Error('The LWS status is invalid.');
  }
  const name = `q-r${encodedRepositoryId}-w${encodedRunId}-a${runAttempt.toString(
    36
  )}-${lwsStatus === 'enabled' ? 'e' : 'd'}`;
  if (
    name.length > SALESFORCE_ORG_NAME_MAX_LENGTH ||
    !/^q-r[1-9a-z][0-9a-z]{0,12}-w[1-9a-z][0-9a-z]{0,12}-a[1-9a-z][0-9a-z]{0,10}-[ed]$/.test(
      name
    )
  ) {
    throw new Error('The deterministic scratch-org name is invalid.');
  }
  return name;
}

export function buildScratchOrgAlias(
  repositoryId: string,
  runId: string,
  runAttempt: number,
  lwsStatus: LwsStatus
): string {
  return buildScratchOrgName(
    repositoryId,
    runId,
    runAttempt,
    lwsStatus
  ).replace(/-/g, '_');
}

export function buildScratchOrgIdentity(
  context: ScratchOrgHandoffContext
): ScratchOrgIdentity {
  validateContext(context);
  const artifactName =
    `quantic-scratch-org-repo-${context.repositoryId}-run-${context.runId}` +
    `-attempt-${context.runAttempt}` +
    `-lws-${context.lwsStatus}`;
  const artifactRoot = path.join(
    context.trustedRoot,
    'quantic-scratch-org-handoffs'
  );
  const artifactDirectory = path.join(artifactRoot, artifactName);
  const orgName = buildScratchOrgName(
    context.repositoryId,
    context.runId,
    context.runAttempt,
    context.lwsStatus
  );
  return {
    alias: buildScratchOrgAlias(
      context.repositoryId,
      context.runId,
      context.runAttempt,
      context.lwsStatus
    ),
    artifactDirectory,
    artifactName,
    artifactRoot,
    handoffFile: path.join(artifactDirectory, 'scratch-org.json'),
    orgName,
  };
}

function validateCommunityUrl(communityUrl: string): void {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(communityUrl);
  } catch {
    throw new Error('The scratch-org handoff community URL is invalid.');
  }
  if (
    parsedUrl.protocol !== 'https:' ||
    !parsedUrl.hostname ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error('The scratch-org handoff community URL is invalid.');
  }
}

function validateUsername(username: string): void {
  if (
    username.length > 320 ||
    !/^[A-Za-z0-9][A-Za-z0-9._+%=-]*@[A-Za-z0-9][A-Za-z0-9.-]*$/.test(
      username
    ) ||
    username.includes('..')
  ) {
    throw new Error('The scratch-org handoff username is invalid.');
  }
}

function validateOrgId(orgId: string): void {
  if (!/^00D[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?$/.test(orgId)) {
    throw new Error('The scratch-org handoff org ID is invalid.');
  }
}

export function createScratchOrgHandoff(
  context: ScratchOrgHandoffContext,
  alias: string,
  username: string,
  orgId: string,
  phase: ScratchOrgHandoffPhase,
  communityUrl: string | null
): ScratchOrgHandoff {
  validateContext(context);
  if (alias !== buildScratchOrgIdentity(context).alias) {
    throw new Error('The scratch-org handoff alias is invalid.');
  }
  validateUsername(username);
  validateOrgId(orgId);
  if (communityUrl === null) {
    if (phase !== 'provisioned' && phase !== 'deleted') {
      throw new Error('The scratch-org handoff community URL is missing.');
    }
  } else {
    validateCommunityUrl(communityUrl);
  }
  if (phase === 'provisioned' && communityUrl !== null) {
    throw new Error(
      'The provisioned scratch-org handoff cannot contain a community URL.'
    );
  }
  return {
    schemaVersion: 3,
    runId: context.runId,
    runAttempt: context.runAttempt,
    repository: context.repository,
    repositoryId: context.repositoryId,
    commitSha: context.commitSha,
    lwsStatus: context.lwsStatus,
    alias,
    username,
    orgId,
    phase,
    communityUrl,
  };
}

async function assertDirectoryWithoutSymlinks(
  directory: string,
  trustedRoot: string
): Promise<void> {
  const trustedRootStats = await fs.promises.lstat(trustedRoot);
  if (!trustedRootStats.isDirectory() || trustedRootStats.isSymbolicLink()) {
    throw new Error('The trusted artifact root is invalid.');
  }
  const relativePath = path.relative(trustedRoot, directory);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('The scratch-org handoff path escapes its trusted root.');
  }
  let currentPath = trustedRoot;
  for (const segment of relativePath.split(path.sep).filter(Boolean)) {
    currentPath = path.join(currentPath, segment);
    const stats = await fs.promises.lstat(currentPath);
    if (!stats.isDirectory() || stats.isSymbolicLink()) {
      throw new Error('A scratch-org handoff directory is invalid.');
    }
  }
  const realTrustedRoot = await fs.promises.realpath(trustedRoot);
  const realDirectory = await fs.promises.realpath(directory);
  const realRelativePath = path.relative(realTrustedRoot, realDirectory);
  if (realRelativePath.startsWith('..') || path.isAbsolute(realRelativePath)) {
    throw new Error(
      'The scratch-org handoff real path escapes its trusted root.'
    );
  }
}

export async function writeScratchOrgHandoff(
  context: ScratchOrgHandoffContext,
  handoff: ScratchOrgHandoff,
  dependencies: ScratchOrgHandoffWriterDependencies = defaultWriterDependencies
): Promise<void> {
  const identity = buildScratchOrgIdentity(context);
  if (
    handoff.runId !== context.runId ||
    handoff.runAttempt !== context.runAttempt ||
    handoff.repository !== context.repository ||
    handoff.repositoryId !== context.repositoryId ||
    handoff.commitSha !== context.commitSha ||
    handoff.lwsStatus !== context.lwsStatus ||
    handoff.alias !== identity.alias
  ) {
    throw new Error(
      'The scratch-org handoff does not match its trusted context.'
    );
  }

  const trustedRootStats = await fs.promises.lstat(context.trustedRoot);
  if (!trustedRootStats.isDirectory() || trustedRootStats.isSymbolicLink()) {
    throw new Error('The trusted artifact root is invalid.');
  }
  for (const directory of [identity.artifactRoot, identity.artifactDirectory]) {
    if (!fs.existsSync(directory)) {
      continue;
    }
    const stats = await fs.promises.lstat(directory);
    if (!stats.isDirectory() || stats.isSymbolicLink()) {
      throw new Error('A scratch-org handoff directory is invalid.');
    }
  }
  await fs.promises.mkdir(identity.artifactDirectory, {
    recursive: true,
    mode: 0o700,
  });
  await assertDirectoryWithoutSymlinks(
    identity.artifactDirectory,
    context.trustedRoot
  );
  if (fs.existsSync(identity.handoffFile)) {
    const destinationStats = await fs.promises.lstat(identity.handoffFile);
    if (!destinationStats.isFile() || destinationStats.isSymbolicLink()) {
      throw new Error('The scratch-org handoff destination is invalid.');
    }
  }

  const temporaryFile = path.join(
    identity.artifactDirectory,
    `.scratch-org.${process.pid}.${Date.now()}.tmp`
  );
  try {
    await fs.promises.writeFile(
      temporaryFile,
      `${JSON.stringify(handoff, null, 2)}\n`,
      {encoding: 'utf8', flag: 'wx', mode: 0o600}
    );
    await dependencies.rename(temporaryFile, identity.handoffFile);
    await fs.promises.chmod(identity.handoffFile, 0o600);
  } finally {
    await fs.promises.rm(temporaryFile, {force: true});
  }
}
