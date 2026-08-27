import {isSalesforceDeploymentId} from './sfdx';

const ACTIVE_DEPLOYMENT_STATUSES = new Set([
  'Canceling',
  'Finalizing',
  'InProgress',
  'Pending',
  'Queued',
]);
const TERMINAL_DEPLOYMENT_STATUSES = new Set([
  'Canceled',
  'Failed',
  'FinalizingFailed',
  'SucceededPartial',
]);
const TRANSIENT_ERROR_CODES = new Set([
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ECONNRESET',
  'ENETUNREACH',
  'ETIMEDOUT',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_SOCKET',
]);
const TRANSIENT_ERROR_MESSAGES = [
  'connection reset',
  'connection timed out',
  'fetch failed',
  'gateway timeout',
  'network request failed',
  'service unavailable',
  'socket hang up',
  'temporary failure',
  'too many requests',
];
const DEPLOYMENT_ID_IN_TEXT = /\b0Af[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?\b/g;
const RELATED_RECORD_KEYS = ['cause', 'data', 'error', 'response', 'result'];
const ID_KEYS = [
  'ID',
  'Id',
  'deployId',
  'deploymentId',
  'id',
  'jobID',
  'jobId',
];

type UnknownRecord = Record<string, unknown>;
type DeploymentState = 'active' | 'succeeded' | 'terminal' | 'unknown';

export interface MetadataDeploymentPolicy {
  maxResumeAttempts: number;
  overallTimeoutMs: number;
  retryDelayMs: number;
  waitMinutes: number;
}

export interface MetadataDeploymentDependencies {
  log: (message: string) => void;
  now: () => number;
  resume: (
    deploymentId: string,
    waitMinutes: number,
    executionTimeoutMs: number
  ) => Promise<unknown>;
  sleep: (durationMs: number) => Promise<void>;
  start: (executionTimeoutMs: number) => Promise<unknown>;
}

export interface MetadataDeploymentOptions {
  dependencies: MetadataDeploymentDependencies;
  isRetryableTerminalFailure?: (error: unknown) => boolean;
  maxLogicalAttempts?: number;
  policy: MetadataDeploymentPolicy;
  step: string;
}

export class MetadataDeploymentRetryError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'MetadataDeploymentRetryError';
    Object.setPrototypeOf(this, MetadataDeploymentRetryError.prototype);
  }
}

export class MetadataDeploymentProtocolError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'MetadataDeploymentProtocolError';
    Object.setPrototypeOf(this, MetadataDeploymentProtocolError.prototype);
  }
}

export class MetadataDeploymentSubmissionError extends Error {
  constructor(public readonly originalError: unknown) {
    super(
      'The asynchronous metadata deployment submission failed without a valid deployment ID; refusing to submit it again.'
    );
    this.name = 'MetadataDeploymentSubmissionError';
    Object.setPrototypeOf(this, MetadataDeploymentSubmissionError.prototype);
  }
}

class TerminalDeploymentFailure extends Error {
  constructor(public readonly originalError: unknown) {
    super('The Salesforce metadata deployment failed terminally.');
    this.name = 'TerminalDeploymentFailure';
    Object.setPrototypeOf(this, TerminalDeploymentFailure.prototype);
  }
}

function asRecord(value: unknown): UnknownRecord | undefined {
  return typeof value === 'object' && value !== null
    ? (value as UnknownRecord)
    : undefined;
}

function collectRelevantRecords(value: unknown): UnknownRecord[] {
  const records: UnknownRecord[] = [];
  const seen = new Set<UnknownRecord>();

  const collect = (candidate: unknown, depth: number) => {
    const record = asRecord(candidate);
    if (!record || seen.has(record) || depth > 2) {
      return;
    }
    seen.add(record);
    records.push(record);
    RELATED_RECORD_KEYS.forEach((key) => collect(record[key], depth + 1));
  };

  collect(value, 0);
  return records;
}

function getString(record: UnknownRecord, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function getNumber(record: UnknownRecord, key: string) {
  const value = record[key];
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number(value);
  }
  return undefined;
}

function getMessages(value: unknown) {
  return collectRelevantRecords(value)
    .map((record) => getString(record, 'message'))
    .filter((message): message is string => message !== undefined);
}

function getDeploymentIdCandidates(value: unknown): unknown[] {
  const records = collectRelevantRecords(value);
  const structuredCandidates = records.flatMap((record) =>
    ID_KEYS.filter((key) => key in record).map((key) => record[key])
  );
  const messageCandidates = getMessages(value).flatMap(
    (message) => message.match(DEPLOYMENT_ID_IN_TEXT) ?? []
  );
  return [...structuredCandidates, ...messageCandidates];
}

function readDeploymentId(
  value: unknown,
  context: string,
  expectedId?: string,
  required = true
): string | undefined {
  const candidates = getDeploymentIdCandidates(value);
  if (candidates.length === 0) {
    if (required) {
      throw new MetadataDeploymentProtocolError(
        `The ${context} response is missing its deployment ID.`,
        value
      );
    }
    return undefined;
  }
  if (!candidates.every(isSalesforceDeploymentId)) {
    throw new MetadataDeploymentProtocolError(
      `The ${context} response contains an invalid deployment ID.`,
      value
    );
  }

  const uniqueIds = Array.from(new Set(candidates));
  if (uniqueIds.length !== 1) {
    throw new MetadataDeploymentProtocolError(
      `The ${context} response contains conflicting deployment IDs.`,
      value
    );
  }
  const [deploymentId] = uniqueIds;
  if (expectedId && deploymentId !== expectedId) {
    throw new MetadataDeploymentProtocolError(
      `The ${context} response changed the deployment ID.`,
      value
    );
  }
  return deploymentId;
}

function getDeploymentState(value: unknown): DeploymentState {
  const records = collectRelevantRecords(value);
  const statuses = records
    .map((record) => getString(record, 'status'))
    .filter((status): status is string => status !== undefined);
  if (statuses.some((status) => TERMINAL_DEPLOYMENT_STATUSES.has(status))) {
    return 'terminal';
  }
  if (statuses.includes('Succeeded')) {
    return 'succeeded';
  }
  if (statuses.some((status) => ACTIVE_DEPLOYMENT_STATUSES.has(status))) {
    return 'active';
  }
  if (
    records.some(
      (record) =>
        record.done === true &&
        (record.success === false || record.success === undefined)
    )
  ) {
    return 'terminal';
  }
  if (
    records.some((record) => record.done === true && record.success === true)
  ) {
    return 'succeeded';
  }
  if (
    records.some(
      (record) =>
        getNumber(record, 'status') === 69 ||
        getNumber(record, 'exitCode') === 69 ||
        getNumber(record, 'code') === 69
    )
  ) {
    return 'active';
  }

  const messages = getMessages(value).map((message) => message.toLowerCase());
  if (
    messages.some(
      (message) =>
        message.includes('the client has timed out') ||
        (message.includes('metadata api') && message.includes('timed out'))
    )
  ) {
    return 'active';
  }
  return 'unknown';
}

function isTransientError(error: unknown): boolean {
  const records = collectRelevantRecords(error);
  if (
    records.some((record) => {
      const code = getString(record, 'code');
      return code ? TRANSIENT_ERROR_CODES.has(code) : false;
    })
  ) {
    return true;
  }

  const messages = getMessages(error).map((message) => message.toLowerCase());
  return messages.some((message) =>
    TRANSIENT_ERROR_MESSAGES.some((part) => message.includes(part))
  );
}

function validatePolicy(
  policy: MetadataDeploymentPolicy,
  maxLogicalAttempts: number
) {
  if (
    !Number.isInteger(policy.maxResumeAttempts) ||
    policy.maxResumeAttempts < 1 ||
    !Number.isInteger(maxLogicalAttempts) ||
    maxLogicalAttempts < 1 ||
    policy.overallTimeoutMs < 1 ||
    policy.retryDelayMs < 0 ||
    !Number.isInteger(policy.waitMinutes) ||
    policy.waitMinutes < 1
  ) {
    throw new Error('Metadata deployment retry policy values are invalid.');
  }
}

function deadlineError(step: string, originalError?: unknown) {
  return new MetadataDeploymentRetryError(
    `The ${step} metadata deployment exceeded its overall deadline.`,
    originalError
  );
}

function getRemainingMs(
  dependencies: MetadataDeploymentDependencies,
  deadline: number,
  step: string,
  originalError?: unknown
) {
  const remainingMs = Math.floor(deadline - dependencies.now());
  if (remainingMs < 1) {
    throw deadlineError(step, originalError);
  }
  return remainingMs;
}

async function sleepBeforeRetry(
  dependencies: MetadataDeploymentDependencies,
  deadline: number,
  delayMs: number,
  step: string,
  originalError: unknown
) {
  if (delayMs === 0) {
    return;
  }
  const remainingMs = getRemainingMs(
    dependencies,
    deadline,
    step,
    originalError
  );
  if (delayMs >= remainingMs) {
    throw deadlineError(step, originalError);
  }
  await dependencies.sleep(delayMs);
  getRemainingMs(dependencies, deadline, step, originalError);
}

function resumeExhaustedError(step: string, originalError?: unknown) {
  return new MetadataDeploymentRetryError(
    `The ${step} metadata deployment exhausted its resume attempts.`,
    originalError
  );
}

async function submitLogicalDeployment(
  dependencies: MetadataDeploymentDependencies,
  deadline: number,
  logicalAttempt: number,
  step: string
): Promise<{completed: boolean; deploymentId: string}> {
  const executionTimeoutMs = getRemainingMs(dependencies, deadline, step);
  dependencies.log(
    `metadata-deployment ${JSON.stringify({
      action: 'start',
      event: 'attempt',
      logicalAttempt,
      step,
    })}`
  );

  try {
    const response = await dependencies.start(executionTimeoutMs);
    const state = getDeploymentState(response);
    const deploymentId = readDeploymentId(response, 'asynchronous submission')!;
    if (state === 'terminal') {
      throw new TerminalDeploymentFailure(response);
    }
    dependencies.log(
      `metadata-deployment ${JSON.stringify({
        action: 'start',
        deploymentId,
        event: 'submitted',
        logicalAttempt,
        step,
      })}`
    );
    return {completed: state === 'succeeded', deploymentId};
  } catch (error) {
    if (
      error instanceof MetadataDeploymentProtocolError ||
      error instanceof TerminalDeploymentFailure
    ) {
      throw error;
    }

    getRemainingMs(dependencies, deadline, step, error);

    const state = getDeploymentState(error);
    if (state === 'terminal') {
      readDeploymentId(error, 'asynchronous submission');
      throw new TerminalDeploymentFailure(error);
    }
    const deploymentId = readDeploymentId(
      error,
      'asynchronous submission',
      undefined,
      state === 'active' || state === 'succeeded'
    );
    if (!deploymentId) {
      throw new MetadataDeploymentSubmissionError(error);
    }
    dependencies.log(
      `metadata-deployment ${JSON.stringify({
        action: 'start',
        deploymentId,
        event: 'submitted',
        logicalAttempt,
        recoveredFromError: true,
        step,
      })}`
    );
    return {completed: state === 'succeeded', deploymentId};
  }
}

async function resumeLogicalDeployment(
  dependencies: MetadataDeploymentDependencies,
  deadline: number,
  deploymentId: string,
  logicalAttempt: number,
  policy: MetadataDeploymentPolicy,
  step: string
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= policy.maxResumeAttempts; attempt++) {
    const executionTimeoutMs = getRemainingMs(
      dependencies,
      deadline,
      step,
      lastError
    );
    dependencies.log(
      `metadata-deployment ${JSON.stringify({
        action: 'resume',
        attempt,
        deploymentId,
        event: 'attempt',
        logicalAttempt,
        step,
      })}`
    );

    try {
      const response = await dependencies.resume(
        deploymentId,
        policy.waitMinutes,
        executionTimeoutMs
      );
      readDeploymentId(response, 'resume', deploymentId);
      const state = getDeploymentState(response);
      if (state === 'succeeded') {
        dependencies.log(
          `metadata-deployment ${JSON.stringify({
            action: 'resume',
            deploymentId,
            event: 'completed',
            logicalAttempt,
            step,
          })}`
        );
        return;
      }
      if (state === 'terminal') {
        throw new TerminalDeploymentFailure(response);
      }
      if (state !== 'active') {
        throw new MetadataDeploymentProtocolError(
          'The resume response has no recognized deployment status.',
          response
        );
      }
      lastError = response;
    } catch (error) {
      if (
        error instanceof MetadataDeploymentProtocolError ||
        error instanceof TerminalDeploymentFailure
      ) {
        throw error;
      }

      getRemainingMs(dependencies, deadline, step, error);

      const state = getDeploymentState(error);
      if (state === 'terminal') {
        readDeploymentId(error, 'resume', deploymentId);
        throw new TerminalDeploymentFailure(error);
      }
      if (state === 'active') {
        readDeploymentId(error, 'resume', deploymentId);
        lastError = error;
      } else if (isTransientError(error)) {
        readDeploymentId(error, 'resume', deploymentId, false);
        lastError = error;
        if (attempt < policy.maxResumeAttempts) {
          dependencies.log(
            `metadata-deployment ${JSON.stringify({
              action: 'resume',
              deploymentId,
              event: 'transient-error',
              logicalAttempt,
              nextAction: 'resume',
              step,
            })}`
          );
          await sleepBeforeRetry(
            dependencies,
            deadline,
            policy.retryDelayMs,
            step,
            error
          );
          continue;
        }
      } else {
        readDeploymentId(error, 'resume', deploymentId);
        throw error;
      }
    }

    if (attempt >= policy.maxResumeAttempts) {
      throw resumeExhaustedError(step, lastError);
    }
    dependencies.log(
      `metadata-deployment ${JSON.stringify({
        action: 'resume',
        deploymentId,
        event: 'active',
        logicalAttempt,
        nextAction: 'resume',
        step,
      })}`
    );
  }
}

export async function runMetadataDeployment({
  dependencies,
  isRetryableTerminalFailure = () => false,
  maxLogicalAttempts = 1,
  policy,
  step,
}: MetadataDeploymentOptions): Promise<void> {
  validatePolicy(policy, maxLogicalAttempts);
  const deadline = dependencies.now() + policy.overallTimeoutMs;

  for (
    let logicalAttempt = 1;
    logicalAttempt <= maxLogicalAttempts;
    logicalAttempt++
  ) {
    try {
      const submission = await submitLogicalDeployment(
        dependencies,
        deadline,
        logicalAttempt,
        step
      );
      if (!submission.completed) {
        await resumeLogicalDeployment(
          dependencies,
          deadline,
          submission.deploymentId,
          logicalAttempt,
          policy,
          step
        );
      }
      return;
    } catch (error) {
      if (!(error instanceof TerminalDeploymentFailure)) {
        throw error;
      }
      if (!isRetryableTerminalFailure(error.originalError)) {
        throw error.originalError;
      }
      if (logicalAttempt >= maxLogicalAttempts) {
        throw new MetadataDeploymentRetryError(
          `The ${step} metadata deployment exhausted its readiness attempts.`,
          error.originalError
        );
      }

      dependencies.log(
        `metadata-deployment ${JSON.stringify({
          event: 'readiness-retry',
          logicalAttempt,
          nextLogicalAttempt: logicalAttempt + 1,
          step,
        })}`
      );
      await sleepBeforeRetry(
        dependencies,
        deadline,
        policy.retryDelayMs,
        step,
        error.originalError
      );
    }
  }
}
