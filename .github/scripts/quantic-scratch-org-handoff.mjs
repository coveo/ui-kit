import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {
  assertAuthoritativeScratchOrg,
  assertScratchOrgId,
  assertSalesforceUsername,
  deleteScratchOrg,
  loginScratchOrgJwt,
  queryScratchOrgsByName,
} from './salesforce-scratch-org.mjs';

export const ARTIFACT_ROOT_NAME = 'quantic-scratch-org-handoffs';
export const CLEANUP_TARGETS_FILE_NAME = 'quantic-scratch-org-cleanup-targets.json';
export const HANDOFF_FILE_NAME = 'scratch-org.json';
export const LWS_STATUSES = ['enabled', 'disabled'];

const SCHEMA_VERSION = 3;
const TARGETS_SCHEMA_VERSION = 2;
const MAX_HANDOFF_BYTES = 16 * 1024;
const MAX_TARGETS_BYTES = 64 * 1024;
const MANIFEST_FIELDS = [
  'schemaVersion',
  'runId',
  'runAttempt',
  'repository',
  'repositoryId',
  'commitSha',
  'lwsStatus',
  'alias',
  'username',
  'orgId',
  'phase',
  'communityUrl',
];
const TARGET_FIELDS = [
  'producerAttempt',
  'lwsStatus',
  'repositoryId',
  'orgName',
  'status',
  'username',
  'orgId',
  'scratchOrgInfoId',
];
const PHASES = new Set(['provisioned', 'published', 'ready', 'deleted']);
const MAX_GITHUB_ID = '18446744073709551615';
const BASE_36_DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
const RECONCILIATION_MAX_ATTEMPTS = 31;
const RECONCILIATION_POLL_INTERVAL_MS = 10 * 1000;

function fail(message) {
  throw new Error(message);
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertExactFields(value, expectedFields, message) {
  const fields = Object.keys(value).sort();
  if (JSON.stringify(fields) !== JSON.stringify([...expectedFields].sort())) {
    fail(message);
  }
}

function assertString(value, field) {
  if (typeof value !== 'string' || value.length === 0) {
    fail(`The scratch-org handoff ${field} is invalid.`);
  }
}

function assertGithubId(value, label) {
  if (
    typeof value !== 'string' ||
    !/^[1-9][0-9]*$/.test(value) ||
    value.length > MAX_GITHUB_ID.length ||
    (value.length === MAX_GITHUB_ID.length && value > MAX_GITHUB_ID)
  ) {
    fail(`The GitHub ${label} is invalid.`);
  }
}

function assertRunId(runId) {
  assertGithubId(runId, 'workflow run ID');
}

function assertRepositoryId(repositoryId) {
  assertGithubId(repositoryId, 'repository ID');
}

function encodeDecimalId(value, label) {
  assertGithubId(value, label);
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

function buildScratchOrgName(repositoryId, runId, runAttempt, lwsStatus) {
  assertRepositoryId(repositoryId);
  assertRunId(runId);
  assertRunAttempt(runAttempt);
  assertLwsStatus(lwsStatus);
  return `q-r${encodeDecimalId(repositoryId, 'repository ID')}-w${encodeDecimalId(
    runId,
    'workflow run ID'
  )}-a${runAttempt.toString(36)}-${lwsStatus === 'enabled' ? 'e' : 'd'}`;
}

function buildScratchOrgAlias(repositoryId, runId, runAttempt, lwsStatus) {
  return buildScratchOrgName(repositoryId, runId, runAttempt, lwsStatus).replace(/-/g, '_');
}

function assertRunAttempt(runAttempt) {
  if (!Number.isSafeInteger(runAttempt) || runAttempt < 1) {
    fail('The workflow run attempt is invalid.');
  }
}

function assertRepository(repository) {
  if (typeof repository !== 'string' || !/^[^/\s]+\/[^/\s]+$/.test(repository)) {
    fail('The workflow repository is invalid.');
  }
}

function assertCommitSha(commitSha) {
  if (typeof commitSha !== 'string' || !/^[a-f0-9]{40}$/.test(commitSha)) {
    fail('The workflow commit SHA is invalid.');
  }
}

function assertLwsStatus(lwsStatus) {
  if (!LWS_STATUSES.includes(lwsStatus)) {
    fail('The LWS status is invalid.');
  }
}

function assertCommunityUrl(communityUrl) {
  assertString(communityUrl, 'community URL');
  let parsedUrl;
  try {
    parsedUrl = new URL(communityUrl);
  } catch {
    fail('The scratch-org handoff community URL is invalid.');
  }
  if (
    parsedUrl.protocol !== 'https:' ||
    !parsedUrl.hostname ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    fail('The scratch-org handoff community URL is invalid.');
  }
}

function assertAbsoluteNormalizedPath(value, label) {
  if (
    typeof value !== 'string' ||
    !path.isAbsolute(value) ||
    path.resolve(value) !== value ||
    value.split(path.sep).includes('..')
  ) {
    fail(`The ${label} path is invalid.`);
  }
}

function assertTrustedPath(candidatePath, trustedRoot, expectedType) {
  assertAbsoluteNormalizedPath(trustedRoot, 'trusted root');
  assertAbsoluteNormalizedPath(candidatePath, 'artifact');
  const relativePath = path.relative(trustedRoot, candidatePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    fail('The artifact path escapes its trusted root.');
  }

  const trustedRootStats = fs.lstatSync(trustedRoot);
  if (!trustedRootStats.isDirectory() || trustedRootStats.isSymbolicLink()) {
    fail('The trusted artifact root is invalid.');
  }
  let currentPath = trustedRoot;
  for (const segment of relativePath.split(path.sep).filter(Boolean)) {
    currentPath = path.join(currentPath, segment);
    const stats = fs.lstatSync(currentPath);
    if (stats.isSymbolicLink()) {
      fail('A symlink is not allowed in the trusted artifact path.');
    }
  }

  const stats = fs.lstatSync(candidatePath);
  if (
    (expectedType === 'directory' && !stats.isDirectory()) ||
    (expectedType === 'file' && !stats.isFile())
  ) {
    fail('The trusted artifact path has an invalid type.');
  }
  const realTrustedRoot = fs.realpathSync(trustedRoot);
  const realCandidate = fs.realpathSync(candidatePath);
  const realRelativePath = path.relative(realTrustedRoot, realCandidate);
  if (realRelativePath.startsWith('..') || path.isAbsolute(realRelativePath)) {
    fail('The artifact real path escapes its trusted root.');
  }
}

function canonicalManifest(value) {
  return {
    schemaVersion: value.schemaVersion,
    runId: value.runId,
    runAttempt: value.runAttempt,
    repository: value.repository,
    repositoryId: value.repositoryId,
    commitSha: value.commitSha,
    lwsStatus: value.lwsStatus,
    alias: value.alias,
    username: value.username,
    orgId: value.orgId,
    phase: value.phase,
    communityUrl: value.communityUrl,
  };
}

export function serializeManifest(manifest) {
  return `${JSON.stringify(canonicalManifest(manifest), null, 2)}\n`;
}

export function expectedContextFromEnvironment(environment = process.env) {
  const requiredVariables = [
    'GITHUB_RUN_ID',
    'GITHUB_RUN_ATTEMPT',
    'GITHUB_REPOSITORY',
    'GITHUB_REPOSITORY_ID',
    'GITHUB_SHA',
  ];
  for (const variable of requiredVariables) {
    if (!environment[variable]) {
      fail(`The ${variable} environment variable is required.`);
    }
  }

  const context = {
    runId: environment.GITHUB_RUN_ID,
    runAttempt: Number(environment.GITHUB_RUN_ATTEMPT),
    repository: environment.GITHUB_REPOSITORY,
    repositoryId: environment.GITHUB_REPOSITORY_ID,
    commitSha: environment.GITHUB_SHA,
  };
  assertRunId(context.runId);
  assertRunAttempt(context.runAttempt);
  assertRepository(context.repository);
  assertRepositoryId(context.repositoryId);
  assertCommitSha(context.commitSha);
  return context;
}

export function buildTrustedCiIdentity(expectedContext, lwsStatus, producerAttempt, trustedRoot) {
  assertRunId(expectedContext.runId);
  assertRunAttempt(expectedContext.runAttempt);
  assertRepository(expectedContext.repository);
  assertRepositoryId(expectedContext.repositoryId);
  assertCommitSha(expectedContext.commitSha);
  assertLwsStatus(lwsStatus);
  assertRunAttempt(producerAttempt);
  assertAbsoluteNormalizedPath(trustedRoot, 'trusted root');

  const artifactName =
    `quantic-scratch-org-repo-${expectedContext.repositoryId}-run-${expectedContext.runId}` +
    `-attempt-${producerAttempt}-lws-${lwsStatus}`;
  const artifactRoot = path.join(trustedRoot, ARTIFACT_ROOT_NAME);
  const artifactDirectory = path.join(artifactRoot, artifactName);
  return {
    alias: buildScratchOrgAlias(
      expectedContext.repositoryId,
      expectedContext.runId,
      producerAttempt,
      lwsStatus
    ),
    artifactDirectory,
    artifactName,
    artifactRoot,
    handoffFile: path.join(artifactDirectory, HANDOFF_FILE_NAME),
    lwsStatus,
    orgName: buildScratchOrgName(
      expectedContext.repositoryId,
      expectedContext.runId,
      producerAttempt,
      lwsStatus
    ),
    producerAttempt,
  };
}

function parseArtifactName(artifactName, expectedContext) {
  const match = artifactName.match(
    /^quantic-scratch-org-repo-([1-9][0-9]*)-run-([1-9][0-9]*)-attempt-([1-9][0-9]*)-lws-(enabled|disabled)$/
  );
  if (!match || match[1] !== expectedContext.repositoryId || match[2] !== expectedContext.runId) {
    fail('The scratch-org handoff artifact name is invalid.');
  }
  const producerAttempt = Number(match[3]);
  assertRunAttempt(producerAttempt);
  if (producerAttempt > expectedContext.runAttempt) {
    fail('The scratch-org handoff artifact comes from a future attempt.');
  }
  return {producerAttempt, lwsStatus: match[4]};
}

export function validateManifest(
  value,
  expectedContext,
  expectedLwsStatus,
  producerAttempt,
  requireReady = false
) {
  if (!isRecord(value)) {
    fail('The scratch-org handoff must be a JSON object.');
  }
  assertExactFields(value, MANIFEST_FIELDS, 'The scratch-org handoff fields are invalid.');
  if (value.schemaVersion !== SCHEMA_VERSION) {
    fail('The scratch-org handoff schema version is invalid.');
  }
  assertRunId(value.runId);
  assertRunAttempt(value.runAttempt);
  assertRepository(value.repository);
  assertRepositoryId(value.repositoryId);
  assertCommitSha(value.commitSha);
  assertLwsStatus(value.lwsStatus);
  assertSalesforceUsername(value.username);
  assertScratchOrgId(value.orgId);
  if (value.lwsStatus !== expectedLwsStatus) {
    fail('The scratch-org handoff LWS status does not match its artifact.');
  }
  if (
    value.alias !==
    buildScratchOrgAlias(
      expectedContext.repositoryId,
      expectedContext.runId,
      producerAttempt,
      expectedLwsStatus
    )
  ) {
    fail('The scratch-org handoff alias does not match its LWS status.');
  }
  if (!PHASES.has(value.phase)) {
    fail('The scratch-org handoff phase is invalid.');
  }
  if (value.communityUrl === null) {
    if (value.phase !== 'provisioned' && value.phase !== 'deleted') {
      fail('The scratch-org handoff community URL is missing.');
    }
  } else {
    assertCommunityUrl(value.communityUrl);
  }
  if (value.phase === 'provisioned' && value.communityUrl !== null) {
    fail('The provisioned scratch-org handoff cannot contain a community URL.');
  }
  if (requireReady && value.phase !== 'ready') {
    fail('The scratch-org handoff is not ready for downstream tests.');
  }
  if (
    value.runId !== expectedContext.runId ||
    value.runAttempt !== producerAttempt ||
    value.repository !== expectedContext.repository ||
    value.repositoryId !== expectedContext.repositoryId ||
    value.commitSha !== expectedContext.commitSha
  ) {
    fail('The scratch-org handoff does not belong to the expected workflow producer.');
  }
  return canonicalManifest(value);
}

export function validateArtifactDirectory(
  artifactDirectory,
  trustedRoot,
  expectedContext,
  expectedLwsStatus,
  producerAttempt,
  requireReady = false
) {
  const identity = buildTrustedCiIdentity(
    expectedContext,
    expectedLwsStatus,
    producerAttempt,
    trustedRoot
  );
  assertAbsoluteNormalizedPath(artifactDirectory, 'artifact directory');
  if (artifactDirectory !== identity.artifactDirectory) {
    fail('The scratch-org handoff directory does not match its trusted identity.');
  }
  assertTrustedPath(artifactDirectory, trustedRoot, 'directory');
  const entries = fs.readdirSync(artifactDirectory, {withFileTypes: true});
  if (
    entries.length !== 1 ||
    entries[0].name !== HANDOFF_FILE_NAME ||
    !entries[0].isFile() ||
    entries[0].isSymbolicLink()
  ) {
    fail('The scratch-org handoff artifact contents are invalid.');
  }

  assertTrustedPath(identity.handoffFile, trustedRoot, 'file');
  const handoffStats = fs.lstatSync(identity.handoffFile);
  if (handoffStats.size > MAX_HANDOFF_BYTES) {
    fail('The scratch-org handoff file is oversized.');
  }
  const source = fs.readFileSync(identity.handoffFile, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch {
    fail('The scratch-org handoff is not valid JSON.');
  }
  const manifest = validateManifest(
    parsed,
    expectedContext,
    expectedLwsStatus,
    producerAttempt,
    requireReady
  );
  if (source !== serializeManifest(manifest)) {
    fail('The scratch-org handoff is not in canonical form.');
  }
  return manifest;
}

export function validateCleanupArtifacts(artifactRoot, trustedRoot, expectedContext) {
  const expectedArtifactRoot = path.join(trustedRoot, ARTIFACT_ROOT_NAME);
  assertAbsoluteNormalizedPath(artifactRoot, 'artifact root');
  if (artifactRoot !== expectedArtifactRoot) {
    fail('The cleanup artifact root does not match its trusted identity.');
  }
  if (!fs.existsSync(artifactRoot)) {
    return [];
  }
  assertTrustedPath(artifactRoot, trustedRoot, 'directory');

  const manifests = [];
  for (const entry of fs.readdirSync(artifactRoot, {withFileTypes: true})) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) {
      fail('The scratch-org handoff artifact collection is invalid.');
    }
    const {producerAttempt, lwsStatus} = parseArtifactName(entry.name, expectedContext);
    manifests.push(
      validateArtifactDirectory(
        path.join(artifactRoot, entry.name),
        trustedRoot,
        expectedContext,
        lwsStatus,
        producerAttempt
      )
    );
  }

  const usernames = manifests.map(({username}) => username);
  const orgIds = manifests.map(({orgId}) => orgId);
  if (new Set(usernames).size !== usernames.length || new Set(orgIds).size !== orgIds.length) {
    fail('The scratch-org handoff artifacts conflict with each other.');
  }
  return manifests;
}

function assertExpectedIdentityMatchesServer(expectedIdentity, record) {
  if (
    (record.username !== null && expectedIdentity.username !== record.username) ||
    (record.orgId !== null && expectedIdentity.orgId !== record.orgId) ||
    ('scratchOrgInfoId' in expectedIdentity &&
      expectedIdentity.scratchOrgInfoId !== record.scratchOrgInfoId)
  ) {
    fail('The trusted scratch-org identity does not match Salesforce.');
  }
}

function targetKey(producerAttempt, lwsStatus) {
  return `${producerAttempt}:${lwsStatus}`;
}

function canonicalTarget(target) {
  return {
    producerAttempt: target.producerAttempt,
    lwsStatus: target.lwsStatus,
    repositoryId: target.repositoryId,
    orgName: target.orgName,
    status: target.status,
    username: target.username,
    orgId: target.orgId,
    scratchOrgInfoId: target.scratchOrgInfoId,
  };
}

function serializeTargets(targets) {
  return `${JSON.stringify(
    {
      schemaVersion: TARGETS_SCHEMA_VERSION,
      targets: targets.map(canonicalTarget),
    },
    null,
    2
  )}\n`;
}

function expectedTargetsFile(trustedRoot) {
  return path.join(trustedRoot, CLEANUP_TARGETS_FILE_NAME);
}

function writeTargetsFile(targetsFile, trustedRoot, targets) {
  assertAbsoluteNormalizedPath(targetsFile, 'cleanup targets');
  if (targetsFile !== expectedTargetsFile(trustedRoot)) {
    fail('The cleanup targets file does not match its trusted identity.');
  }
  assertTrustedPath(trustedRoot, trustedRoot, 'directory');
  if (fs.existsSync(targetsFile)) {
    const stats = fs.lstatSync(targetsFile);
    if (!stats.isFile() || stats.isSymbolicLink()) {
      fail('The cleanup targets destination is invalid.');
    }
  }
  const temporaryFile = `${targetsFile}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryFile, serializeTargets(targets), {
      encoding: 'utf8',
      flag: 'wx',
      mode: 0o600,
    });
    fs.renameSync(temporaryFile, targetsFile);
    fs.chmodSync(targetsFile, 0o600);
  } finally {
    fs.rmSync(temporaryFile, {force: true});
  }
  assertTrustedPath(targetsFile, trustedRoot, 'file');
}

function validateTarget(value, expectedContext, trustedRoot) {
  if (!isRecord(value)) {
    fail('A cleanup target is invalid.');
  }
  assertExactFields(value, TARGET_FIELDS, 'The cleanup target fields are invalid.');
  assertRunAttempt(value.producerAttempt);
  if (value.producerAttempt > expectedContext.runAttempt) {
    fail('A cleanup target comes from a future attempt.');
  }
  assertLwsStatus(value.lwsStatus);
  assertRepositoryId(value.repositoryId);
  if (value.repositoryId !== expectedContext.repositoryId) {
    fail('A cleanup target has an invalid repository identity.');
  }
  assertAuthoritativeScratchOrg(value);
  const identity = buildTrustedCiIdentity(
    expectedContext,
    value.lwsStatus,
    value.producerAttempt,
    trustedRoot
  );
  if (value.orgName !== identity.orgName) {
    fail('A cleanup target has an invalid deterministic org name.');
  }
  return canonicalTarget(value);
}

function readTargetsFile(targetsFile, trustedRoot, expectedContext) {
  assertAbsoluteNormalizedPath(targetsFile, 'cleanup targets');
  if (targetsFile !== expectedTargetsFile(trustedRoot)) {
    fail('The cleanup targets file does not match its trusted identity.');
  }
  assertTrustedPath(targetsFile, trustedRoot, 'file');
  const stats = fs.lstatSync(targetsFile);
  if (stats.size > MAX_TARGETS_BYTES || (stats.mode & 0o077) !== 0) {
    fail('The cleanup targets file permissions or size are invalid.');
  }
  const source = fs.readFileSync(targetsFile, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch {
    fail('The cleanup targets file is not valid JSON.');
  }
  if (
    !isRecord(parsed) ||
    parsed.schemaVersion !== TARGETS_SCHEMA_VERSION ||
    !Array.isArray(parsed.targets) ||
    Object.keys(parsed).sort().join(',') !== 'schemaVersion,targets'
  ) {
    fail('The cleanup targets file is invalid.');
  }
  const targets = parsed.targets.map((target) =>
    validateTarget(target, expectedContext, trustedRoot)
  );
  if (source !== serializeTargets(targets)) {
    fail('The cleanup targets file is not in canonical form.');
  }
  return targets;
}

export function writeGitHubOutputs(outputPath, outputs) {
  const lines = Object.entries(outputs).map(([key, value]) => {
    if (!/^[a-z][a-z0-9-]*$/.test(key) || typeof value !== 'string' || /[\r\n]/.test(value)) {
      fail('A scratch-org handoff output is invalid.');
    }
    return `${key}=${value}`;
  });
  fs.appendFileSync(outputPath, `${lines.join('\n')}\n`, {encoding: 'utf8'});
}

function parseArguments(values, allowedArguments) {
  if (values.length % 2 !== 0) {
    fail('Scratch-org handoff command arguments are invalid.');
  }
  const parsed = {};
  for (let index = 0; index < values.length; index += 2) {
    const name = values[index];
    const value = values[index + 1];
    if (!name.startsWith('--') || !allowedArguments.has(name) || name in parsed || !value) {
      fail('Scratch-org handoff command arguments are invalid.');
    }
    parsed[name] = value;
  }
  return parsed;
}

function requiredArgument(argumentsByName, name) {
  if (!argumentsByName[name]) {
    fail(`The ${name} argument is required.`);
  }
  return argumentsByName[name];
}

function parseAttempt(value) {
  if (!/^[1-9][0-9]*$/.test(value)) {
    fail('The producer attempt argument is invalid.');
  }
  const attempt = Number(value);
  assertRunAttempt(attempt);
  return attempt;
}

function queryOptions() {
  return process.env.QUANTIC_SF_EXECUTABLE ? {sfExecutable: process.env.QUANTIC_SF_EXECUTABLE} : {};
}

function testPollingInteger(name, fallback, minimum) {
  const value = process.env[name];
  if (!process.env.QUANTIC_SF_EXECUTABLE || value === undefined) {
    return fallback;
  }
  if (!/^[0-9]+$/.test(value)) {
    fail('The scratch-org reconciliation policy is invalid.');
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > 1000) {
    fail('The scratch-org reconciliation policy is invalid.');
  }
  return parsed;
}

function reconciliationPolicy() {
  const maxAttempts = testPollingInteger(
    'QUANTIC_SCRATCH_ORG_MAX_POLL_ATTEMPTS',
    RECONCILIATION_MAX_ATTEMPTS,
    1
  );
  const zeroObservationLimit = testPollingInteger(
    'QUANTIC_SCRATCH_ORG_ZERO_OBSERVATIONS',
    maxAttempts,
    1
  );
  if (zeroObservationLimit > maxAttempts) {
    fail('The scratch-org reconciliation policy is invalid.');
  }
  return {
    intervalMs: testPollingInteger(
      'QUANTIC_SCRATCH_ORG_POLL_INTERVAL_MS',
      RECONCILIATION_POLL_INTERVAL_MS,
      0
    ),
    maxAttempts,
    zeroObservationLimit,
  };
}

function waitForNextPoll(intervalMs) {
  if (intervalMs > 0) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, intervalMs);
  }
}

function assertRecordContinuity(state, record) {
  for (const field of ['scratchOrgInfoId', 'orgId', 'username']) {
    if (record[field] === null) {
      continue;
    }
    if (state.observed[field] !== undefined && state.observed[field] !== record[field]) {
      fail('The Salesforce scratch-org identity changed during reconciliation.');
    }
    state.observed[field] = record[field];
  }
}

export function reconcileScratchOrgIdentities(
  candidates,
  devHubUsername,
  policy = reconciliationPolicy()
) {
  const states = candidates.map((candidate) => ({
    candidate,
    observed: {},
    outcome: undefined,
    sawRecord: false,
    zeroObservations: 0,
  }));

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    for (const state of states.filter(({outcome}) => outcome === undefined)) {
      const records = queryScratchOrgsByName(
        {devHubUsername, orgName: state.candidate.identity.orgName},
        queryOptions()
      );
      if (records.length === 0) {
        state.zeroObservations++;
        if (!state.sawRecord && state.zeroObservations >= policy.zeroObservationLimit) {
          state.outcome = {kind: 'absent'};
        }
        continue;
      }

      const record = records[0];
      state.sawRecord = true;
      assertRecordContinuity(state, record);
      if (state.candidate.expectedIdentity) {
        assertExpectedIdentityMatchesServer(state.candidate.expectedIdentity, record);
      }
      if (record.status === 'Active') {
        assertAuthoritativeScratchOrg(record);
        state.outcome = {kind: 'active', record};
      } else if (record.status === 'Error' || record.status === 'Deleted') {
        state.outcome = {kind: 'terminal', record};
      }
    }

    if (states.every(({outcome}) => outcome !== undefined)) {
      return states.map(({candidate, outcome}) => ({candidate, outcome}));
    }
    if (attempt === policy.maxAttempts) {
      fail('Scratch-org reconciliation timed out before reaching a terminal state.');
    }
    waitForNextPoll(policy.intervalMs);
  }
  fail('Scratch-org reconciliation failed.');
}

function runValidateReady(values) {
  const argumentsByName = parseArguments(
    values,
    new Set([
      '--artifact-directory',
      '--trusted-root',
      '--lws-status',
      '--producer-attempt',
      '--dev-hub-username',
      '--github-output',
    ])
  );
  const expectedContext = expectedContextFromEnvironment();
  const trustedRoot = requiredArgument(argumentsByName, '--trusted-root');
  const lwsStatus = requiredArgument(argumentsByName, '--lws-status');
  assertLwsStatus(lwsStatus);
  const producerAttempt = parseAttempt(requiredArgument(argumentsByName, '--producer-attempt'));
  if (producerAttempt !== expectedContext.runAttempt) {
    fail('Apex requires a handoff from the current workflow attempt.');
  }
  const identity = buildTrustedCiIdentity(expectedContext, lwsStatus, producerAttempt, trustedRoot);
  const manifest = validateArtifactDirectory(
    requiredArgument(argumentsByName, '--artifact-directory'),
    trustedRoot,
    expectedContext,
    lwsStatus,
    producerAttempt,
    true
  );
  const [{outcome}] = reconcileScratchOrgIdentities(
    [{identity, expectedIdentity: manifest}],
    requiredArgument(argumentsByName, '--dev-hub-username')
  );
  if (outcome.kind !== 'active') {
    fail('Salesforce did not return an active deterministic scratch org.');
  }
  const authoritativeOrg = outcome.record;
  if (argumentsByName['--github-output']) {
    writeGitHubOutputs(argumentsByName['--github-output'], {
      username: authoritativeOrg.username,
      'org-id': authoritativeOrg.orgId,
      'scratch-org-info-id': authoritativeOrg.scratchOrgInfoId,
      alias: identity.alias,
      'community-url': manifest.communityUrl,
      'lws-status': lwsStatus,
      'producer-attempt': String(producerAttempt),
      'org-name': identity.orgName,
    });
  }
}

function runValidateCleanup(values) {
  const argumentsByName = parseArguments(
    values,
    new Set([
      '--artifact-root',
      '--trusted-root',
      '--dev-hub-username',
      '--targets-file',
      '--github-output',
    ])
  );
  const expectedContext = expectedContextFromEnvironment();
  const trustedRoot = requiredArgument(argumentsByName, '--trusted-root');
  const manifests = validateCleanupArtifacts(
    requiredArgument(argumentsByName, '--artifact-root'),
    trustedRoot,
    expectedContext
  );
  const manifestsByIdentity = new Map(
    manifests.map((manifest) => [targetKey(manifest.runAttempt, manifest.lwsStatus), manifest])
  );

  const candidates = [];
  for (let producerAttempt = 1; producerAttempt <= expectedContext.runAttempt; producerAttempt++) {
    for (const lwsStatus of LWS_STATUSES) {
      const identity = buildTrustedCiIdentity(
        expectedContext,
        lwsStatus,
        producerAttempt,
        trustedRoot
      );
      candidates.push({
        identity,
        expectedIdentity: manifestsByIdentity.get(targetKey(producerAttempt, lwsStatus)),
      });
    }
  }

  const targets = reconcileScratchOrgIdentities(
    candidates,
    requiredArgument(argumentsByName, '--dev-hub-username')
  )
    .filter(({outcome}) => outcome.kind === 'active')
    .map(({candidate, outcome}) =>
      canonicalTarget({
        producerAttempt: candidate.identity.producerAttempt,
        lwsStatus: candidate.identity.lwsStatus,
        repositoryId: expectedContext.repositoryId,
        ...outcome.record,
      })
    );

  writeTargetsFile(requiredArgument(argumentsByName, '--targets-file'), trustedRoot, targets);
  const attemptsFor = (lwsStatus) =>
    targets
      .filter((target) => target.lwsStatus === lwsStatus)
      .map(({producerAttempt}) => producerAttempt)
      .join(',');
  const countFor = (lwsStatus) =>
    String(targets.filter((target) => target.lwsStatus === lwsStatus).length);
  writeGitHubOutputs(requiredArgument(argumentsByName, '--github-output'), {
    'target-count': String(targets.length),
    'enabled-target-count': countFor('enabled'),
    'disabled-target-count': countFor('disabled'),
    'enabled-producer-attempts': attemptsFor('enabled'),
    'disabled-producer-attempts': attemptsFor('disabled'),
  });
}

function runDeleteCleanup(values) {
  const argumentsByName = parseArguments(
    values,
    new Set(['--targets-file', '--trusted-root', '--lws-status', '--dev-hub-username'])
  );
  const expectedContext = expectedContextFromEnvironment();
  const trustedRoot = requiredArgument(argumentsByName, '--trusted-root');
  const lwsStatus = requiredArgument(argumentsByName, '--lws-status');
  assertLwsStatus(lwsStatus);
  const clientId = process.env.SFDX_AUTH_CLIENT_ID;
  const jwtKeyFile = process.env.SFDX_AUTH_JWT_KEY_FILE;
  if (!clientId || !jwtKeyFile) {
    fail('Salesforce cleanup authentication is not configured.');
  }
  const targets = readTargetsFile(
    requiredArgument(argumentsByName, '--targets-file'),
    trustedRoot,
    expectedContext
  ).filter((target) => target.lwsStatus === lwsStatus);

  for (const target of targets) {
    const [{outcome}] = reconcileScratchOrgIdentities(
      [{identity: target, expectedIdentity: target}],
      requiredArgument(argumentsByName, '--dev-hub-username')
    );
    if (outcome.kind !== 'active') {
      continue;
    }
    const authoritativeOrg = outcome.record;
    loginScratchOrgJwt({clientId, jwtKeyFile, username: authoritativeOrg.username}, queryOptions());
    deleteScratchOrg({username: authoritativeOrg.username}, queryOptions());
  }
}

export function main(argv = process.argv.slice(2)) {
  const [command, ...values] = argv;
  if (command === 'validate-ready') {
    runValidateReady(values);
    return;
  }
  if (command === 'validate-cleanup') {
    runValidateCleanup(values);
    return;
  }
  if (command === 'delete-cleanup') {
    runDeleteCleanup(values);
    return;
  }
  fail('The scratch-org handoff command is invalid.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown validation failure.';
    console.error(`Scratch-org handoff validation failed: ${message}`);
    process.exitCode = 1;
  }
}
