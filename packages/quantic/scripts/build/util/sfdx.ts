import {exec, execFile} from 'child_process';

const MAX_BUFFER = 1024 * 1024 * 1.5;
const SALESFORCE_DEPLOYMENT_ID = /^0Af[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?$/;

export type SfdxExecutor = (
  command: string,
  callback: (error: Error | null, stdout: string, stderr: string) => void
) => void;

const defaultExecutor: SfdxExecutor = (command, callback) => {
  exec(
    command,
    {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: MAX_BUFFER,
    },
    (error, stdout, stderr) => callback(error, stdout, stderr)
  );
};

export interface SfCommandExecutorOptions {
  cwd: string;
  encoding: BufferEncoding;
  env: NodeJS.ProcessEnv;
  maxBuffer: number;
  timeout: number;
}

export interface KillableProcess {
  kill: (signal?: NodeJS.Signals | number) => boolean;
}

export type SfCommandExecutor = (
  executable: string,
  args: readonly string[],
  options: SfCommandExecutorOptions,
  callback: (error: Error | null, stdout: string, stderr: string) => void
) => KillableProcess;

const defaultSfCommandExecutor: SfCommandExecutor = (
  executable,
  args,
  options,
  callback
) =>
  execFile(executable, [...args], options, (error, stdout, stderr) =>
    callback(error, stdout, stderr)
  );

function stripColor(str: string) {
  return str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '');
}

export interface SfdxResponse {
  status: number;
  result: object;
}

export class SfCommandExecutionTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`The Salesforce CLI process exceeded its ${timeoutMs}ms deadline.`);
    this.name = 'SfCommandExecutionTimeoutError';
    Object.setPrototypeOf(this, SfCommandExecutionTimeoutError.prototype);
  }
}

export function isSalesforceDeploymentId(value: unknown): value is string {
  return typeof value === 'string' && SALESFORCE_DEPLOYMENT_ID.test(value);
}

function parseSfdxOutput<T>(error: Error | null, stdout: string): T {
  if (!stdout) {
    throw error ?? new Error('The Salesforce CLI returned no JSON output.');
  }

  let jsonOutput: T;
  try {
    jsonOutput = JSON.parse(stripColor(stdout)) as T;
  } catch (jsonError) {
    throw error ?? jsonError;
  }

  if (error) {
    throw jsonOutput;
  }
  return jsonOutput;
}

function isChildProcessTimeout(error: Error): boolean {
  const processError = error as Error & {
    code?: string;
    killed?: boolean;
    signal?: NodeJS.Signals;
  };
  return (
    processError.code === 'ETIMEDOUT' ||
    (processError.killed === true && processError.signal === 'SIGTERM')
  );
}

export function sfdx<T = SfdxResponse>(
  command: string,
  executor: SfdxExecutor = defaultExecutor
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    executor(`sf ${command} --json`, (error, stdout) => {
      try {
        resolve(parseSfdxOutput<T>(error, stdout));
      } catch (outputError) {
        reject(outputError);
      }
    });
  });
}

export function sfCommand<T = SfdxResponse>(
  args: readonly string[],
  timeoutMs: number,
  executor: SfCommandExecutor = defaultSfCommandExecutor
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return Promise.reject(
      new SfCommandExecutionTimeoutError(Math.max(0, timeoutMs))
    );
  }

  const processTimeoutMs = Math.max(1, Math.floor(timeoutMs));
  return new Promise<T>((resolve, reject) => {
    let child: KillableProcess | undefined;
    let settled = false;
    let timer: NodeJS.Timeout | undefined;

    const settle = (action: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      if (timer) {
        clearTimeout(timer);
      }
      action();
    };

    try {
      child = executor(
        'sf',
        [...args, '--json'],
        {
          cwd: process.cwd(),
          encoding: 'utf8',
          env: process.env,
          maxBuffer: MAX_BUFFER,
          timeout: processTimeoutMs,
        },
        (error, stdout) => {
          if (error && isChildProcessTimeout(error)) {
            settle(() =>
              reject(new SfCommandExecutionTimeoutError(processTimeoutMs))
            );
            return;
          }
          try {
            const output = parseSfdxOutput<T>(error, stdout);
            settle(() => resolve(output));
          } catch (outputError) {
            settle(() => reject(outputError));
          }
        }
      );
    } catch (error) {
      settle(() => reject(error));
      return;
    }

    if (!settled) {
      timer = setTimeout(() => {
        child?.kill('SIGTERM');
        settle(() =>
          reject(new SfCommandExecutionTimeoutError(processTimeoutMs))
        );
      }, processTimeoutMs);
    }
  });
}
