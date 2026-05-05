import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {VitestA11yReporter} from '../src/reporter/vitest-a11y-reporter.js';

interface AxeRule {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  tags: string[];
  helpUrl: string;
  description?: string;
  help?: string;
  nodes: Array<{html: string; target: string[]; failureSummary: string}>;
}

interface AxeResultsLite {
  testEngine: {name: string; version: string};
  violations: AxeRule[];
  passes: AxeRule[];
  incomplete: AxeRule[];
  inapplicable: AxeRule[];
}

const buildAxeRule = (
  id: string,
  tags: string[],
  nodes: number,
  impact: AxeRule['impact'] = 'serious'
): AxeRule => ({
  id,
  impact,
  tags,
  helpUrl: `https://dequeuniversity.com/rules/axe/${id}`,
  description: `${id} description`,
  help: `${id} help`,
  nodes: Array.from({length: nodes}, (_, i) => ({
    html: `<div data-i="${i}"/>`,
    target: [`#node-${i}`],
    failureSummary: `Fix ${id} #${i}`,
  })),
});

const buildAxeResults = (
  overrides: Partial<AxeResultsLite> = {}
): AxeResultsLite => ({
  testEngine: {name: 'axe-core', version: '4.10.0'},
  violations: [],
  passes: [],
  incomplete: [],
  inapplicable: [],
  ...overrides,
});

const buildTestCase = (opts: {
  storyId: string;
  modulePath: string;
  axeResults: AxeResultsLite;
  projectName?: string;
}) => ({
  id: opts.storyId,
  project: {name: opts.projectName ?? 'storybook'},
  module: {
    relativeModuleId: opts.modulePath,
    moduleId: opts.modulePath,
  },
  meta: () => ({
    storyId: opts.storyId,
    componentPath: opts.modulePath,
    componentName: 'TestComponent',
    reports: [
      {
        type: 'a11y',
        version: 1,
        result: opts.axeResults,
        status: opts.axeResults.violations.length > 0 ? 'failed' : 'passed',
      },
    ],
  }),
  result: () => ({state: 'passed'}),
});

describe('VitestA11yReporter — run-end gating', () => {
  let tmpDir: string;
  let outputFile: string;
  let packageJsonPath: string;
  let originalExitCode: number | string | undefined;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'a11y-reporter-'));
    outputFile = path.join(tmpDir, 'a11y-report.json');
    packageJsonPath = path.resolve(
      __dirname,
      '..',
      '..',
      'atomic',
      'package.json'
    );
    originalExitCode = process.exitCode;
    process.exitCode = 0;
    stderrSpy = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
  });

  afterEach(async () => {
    stderrSpy.mockRestore();
    process.exitCode = originalExitCode;
    await rm(tmpDir, {recursive: true, force: true});
  });

  it('writes the report and leaves exit code untouched when there are no violations', async () => {
    const reporter = new VitestA11yReporter({outputFile, packageJsonPath});

    reporter.onTestCaseResult(
      // biome-ignore lint/suspicious/noExplicitAny: simplified test fixture
      buildTestCase({
        storyId: 'atomic-tab--default',
        modulePath: 'src/components/common/atomic-tab/atomic-tab.stories.tsx',
        axeResults: buildAxeResults({
          passes: [buildAxeRule('color-contrast', ['wcag2aa', 'wcag143'], 1)],
        }),
      }) as any
    );

    await reporter.onTestRunEnd([], [], 'passed');

    expect(process.exitCode).toBe(0);
    expect(stderrSpy).not.toHaveBeenCalled();

    const written = JSON.parse(await readFile(outputFile, 'utf8'));
    expect(written.summary.totalComponents).toBe(1);
    const totalViolations = written.components.reduce(
      (sum: number, c: {automated?: {violations?: number}}) =>
        sum + (c.automated?.violations ?? 0),
      0
    );
    expect(totalViolations).toBe(0);
  });

  it('sets process.exitCode to 1 and prints a summary when violations exist', async () => {
    const reporter = new VitestA11yReporter({outputFile, packageJsonPath});

    reporter.onTestCaseResult(
      // biome-ignore lint/suspicious/noExplicitAny: simplified test fixture
      buildTestCase({
        storyId: 'atomic-tab--broken',
        modulePath: 'src/components/common/atomic-tab/atomic-tab.stories.tsx',
        axeResults: buildAxeResults({
          violations: [
            buildAxeRule('image-alt', ['wcag2a', 'wcag111'], 2, 'critical'),
            buildAxeRule('button-name', ['wcag2a', 'wcag412'], 1, 'serious'),
          ],
        }),
      }) as any
    );

    await reporter.onTestRunEnd([], [], 'passed');

    expect(process.exitCode).toBe(1);
    expect(stderrSpy).toHaveBeenCalled();
    const summary = stderrSpy.mock.calls
      .map(([chunk]) => String(chunk))
      .join('');
    expect(summary).toContain('Accessibility violations detected');
    expect(summary).toContain('image-alt');
    expect(summary).toContain('button-name');
    expect(summary).toContain('atomic-tab--broken');

    const written = JSON.parse(await readFile(outputFile, 'utf8'));
    const totalViolations = written.components.reduce(
      (sum: number, c: {automated?: {violations?: number}}) =>
        sum + (c.automated?.violations ?? 0),
      0
    );
    expect(totalViolations).toBe(2);
  });

  it('resets accumulated state between test runs', async () => {
    const reporter = new VitestA11yReporter({outputFile, packageJsonPath});

    reporter.onTestRunStart();
    reporter.onTestCaseResult(
      // biome-ignore lint/suspicious/noExplicitAny: simplified test fixture
      buildTestCase({
        storyId: 'atomic-tab--broken',
        modulePath: 'src/components/common/atomic-tab/atomic-tab.stories.tsx',
        axeResults: buildAxeResults({
          violations: [buildAxeRule('image-alt', ['wcag2a', 'wcag111'], 1)],
        }),
      }) as any
    );

    await reporter.onTestRunEnd([], [], 'passed');
    expect(process.exitCode).toBe(1);

    process.exitCode = 0;
    stderrSpy.mockClear();

    reporter.onTestRunStart();
    reporter.onTestCaseResult(
      // biome-ignore lint/suspicious/noExplicitAny: simplified test fixture
      buildTestCase({
        storyId: 'atomic-tab--broken',
        modulePath: 'src/components/common/atomic-tab/atomic-tab.stories.tsx',
        axeResults: buildAxeResults({
          passes: [buildAxeRule('color-contrast', ['wcag2aa', 'wcag143'], 1)],
        }),
      }) as any
    );

    await reporter.onTestRunEnd([], [], 'passed');

    expect(process.exitCode).toBe(0);
    expect(stderrSpy).not.toHaveBeenCalled();

    const written = JSON.parse(await readFile(outputFile, 'utf8'));
    const totalViolations = written.components.reduce(
      (sum: number, c: {automated?: {violations?: number}}) =>
        sum + (c.automated?.violations ?? 0),
      0
    );
    expect(totalViolations).toBe(0);
  });

  it('does not gate when failOnViolations is disabled', async () => {
    const reporter = new VitestA11yReporter({
      outputFile,
      packageJsonPath,
      failOnViolations: false,
    });

    reporter.onTestCaseResult(
      // biome-ignore lint/suspicious/noExplicitAny: simplified test fixture
      buildTestCase({
        storyId: 'atomic-tab--broken',
        modulePath: 'src/components/common/atomic-tab/atomic-tab.stories.tsx',
        axeResults: buildAxeResults({
          violations: [buildAxeRule('image-alt', ['wcag2a', 'wcag111'], 1)],
        }),
      }) as any
    );

    await reporter.onTestRunEnd([], [], 'passed');

    expect(process.exitCode).toBe(0);
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it('does not gate when the run was interrupted', async () => {
    const reporter = new VitestA11yReporter({outputFile, packageJsonPath});

    reporter.onTestCaseResult(
      // biome-ignore lint/suspicious/noExplicitAny: simplified test fixture
      buildTestCase({
        storyId: 'atomic-tab--broken',
        modulePath: 'src/components/common/atomic-tab/atomic-tab.stories.tsx',
        axeResults: buildAxeResults({
          violations: [buildAxeRule('image-alt', ['wcag2a', 'wcag111'], 1)],
        }),
      }) as any
    );

    await reporter.onTestRunEnd([], [], 'interrupted');

    expect(process.exitCode).toBe(0);
    expect(stderrSpy).not.toHaveBeenCalled();
  });
});
