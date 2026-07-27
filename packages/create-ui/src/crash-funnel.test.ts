import {readFile, rm} from 'node:fs/promises';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {resetRunContext, resolveCrashReportPath} from './crash-report.js';
import {ExpectedError} from './errors.js';
import {main, reportCrashIfUnexpected} from './index.js';
import {log} from './log.js';
import {submitReport} from './submit-report.js';

vi.mock('./submit-report.js', () => ({submitReport: vi.fn(async () => 0)}));
vi.mock('./log.js', () => ({
  log: {
    info: vi.fn(),
    step: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    note: vi.fn(),
  },
}));

describe('report subcommand routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes `report <path>` to submitReport and returns its exit code', async () => {
    vi.mocked(submitReport).mockResolvedValue(3);
    const code = await main(['report', '/tmp/create-ui-crash-abc.json']);
    expect(submitReport).toHaveBeenCalledWith('/tmp/create-ui-crash-abc.json');
    expect(code).toBe(3);
  });
});

describe('reportCrashIfUnexpected', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRunContext();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does nothing for an expected error', async () => {
    await reportCrashIfUnexpected(new ExpectedError('handled'));
    expect(log.note).not.toHaveBeenCalled();
  });

  it('does nothing when DO_NOT_TRACK is set', async () => {
    vi.stubEnv('DO_NOT_TRACK', '1');
    await reportCrashIfUnexpected(new Error('boom'));
    expect(log.note).not.toHaveBeenCalled();
  });

  it('writes a report with its origin and prints the submit command for an unexpected error', async () => {
    await reportCrashIfUnexpected(new Error('boom'), 'unhandled-rejection');

    expect(log.note).toHaveBeenCalledOnce();
    const [message, title] = vi.mocked(log.note).mock.calls[0];
    expect(title).toBe('Crash report');
    expect(message).toContain('npx @coveo/create-ui report ');

    const referenceMatch = message.match(
      /npx @coveo\/create-ui report ([a-f\d]{12})/
    );
    expect(referenceMatch).not.toBeNull();
    if (referenceMatch) {
      const reportPath = resolveCrashReportPath(referenceMatch[1]);
      expect(message).toContain(reportPath);
      const report = JSON.parse(await readFile(reportPath, 'utf8'));
      expect(report.origin).toBe('unhandled-rejection');
      await rm(reportPath, {force: true});
    }
  });
});
