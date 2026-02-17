import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  DEFAULT_A11Y_REPORT_FILENAME,
  DEFAULT_A11Y_REPORT_OUTPUT_DIR,
} from '../shared/constants.js';
import {isA11yReport} from '../shared/guards.js';
import {
  createMockAxeResults,
  createMockAxeRule,
  createMockTestCase,
} from './helpers/mock-factories.js';

const fsMock = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

const fsPromisesMock = vi.hoisted(() => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('node:fs', () => fsMock);
vi.mock('node:fs/promises', () => fsPromisesMock);

import {VitestA11yReporter} from '../reporter/vitest-a11y-reporter.js';

const defaultPackageMetadata = JSON.stringify({
  version: '3.1.0',
  devDependencies: {
    'axe-core': '4.10.0',
    storybook: '8.0.0',
  },
});

function getWrittenReport(callIndex = 0): unknown {
  const serializedReport = fsPromisesMock.writeFile.mock.calls[callIndex]?.[1];
  return JSON.parse(serializedReport as string);
}

async function runTestRunEnd(reporter: VitestA11yReporter): Promise<void> {
  await reporter.onTestRunEnd([], [], 'passed');
}

describe('VitestA11yReporter', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.clearAllMocks();
    process.argv = ['node', 'vitest'];

    fsMock.existsSync.mockReturnValue(true);
    fsMock.readFileSync.mockReturnValue(defaultPackageMetadata);
    fsPromisesMock.mkdir.mockResolvedValue(undefined);
    fsPromisesMock.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe('constructor', () => {
    it('uses default output options when none are provided', async () => {
      const reporter = new VitestA11yReporter();
      reporter.onTestCaseResult(createMockTestCase() as never);

      await runTestRunEnd(reporter);

      expect(fsPromisesMock.mkdir).toHaveBeenCalledWith(
        DEFAULT_A11Y_REPORT_OUTPUT_DIR,
        {recursive: true}
      );
      expect(fsPromisesMock.writeFile).toHaveBeenCalledWith(
        path.resolve(
          DEFAULT_A11Y_REPORT_OUTPUT_DIR,
          DEFAULT_A11Y_REPORT_FILENAME
        ),
        expect.any(String),
        'utf8'
      );
    });

    it('uses custom output options and totalCriteria when provided', async () => {
      const reporter = new VitestA11yReporter({
        outputDir: 'custom/reports',
        outputFilename: 'custom-a11y.json',
        totalCriteria: 1,
      });

      reporter.onTestCaseResult(
        createMockTestCase({
          axeResults: createMockAxeResults({
            violations: [
              createMockAxeRule({id: 'color-contrast', tags: ['wcag143']}),
            ],
          }),
        }) as never
      );

      await runTestRunEnd(reporter);

      expect(fsPromisesMock.mkdir).toHaveBeenCalledWith('custom/reports', {
        recursive: true,
      });
      expect(fsPromisesMock.writeFile).toHaveBeenCalledWith(
        path.resolve('custom/reports', 'custom-a11y.json'),
        expect.any(String),
        'utf8'
      );

      const report = getWrittenReport() as {
        summary: {automatedCoverage: string};
      };
      expect(report.summary.automatedCoverage).toBe('100%');
    });

    it('reads package metadata from the provided packageJsonPath', () => {
      const packageJsonPath = './fixtures/package.json';
      new VitestA11yReporter({packageJsonPath});

      expect(fsMock.existsSync).toHaveBeenCalledWith(
        path.resolve(packageJsonPath)
      );
      expect(fsMock.readFileSync).toHaveBeenCalledWith(
        path.resolve(packageJsonPath),
        'utf8'
      );
    });
  });

  describe('onTestCaseResult()', () => {
    it('skips non-storybook projects', async () => {
      const reporter = new VitestA11yReporter();

      reporter.onTestCaseResult(
        createMockTestCase({projectName: 'unit'}) as never
      );

      await runTestRunEnd(reporter);
      expect(fsPromisesMock.writeFile).not.toHaveBeenCalled();
    });

    it('processes axe results and accumulates a component', async () => {
      const reporter = new VitestA11yReporter();

      reporter.onTestCaseResult(
        createMockTestCase({
          axeResults: createMockAxeResults({
            violations: [
              createMockAxeRule({id: 'color-contrast', tags: ['wcag143']}),
            ],
            passes: [createMockAxeRule({id: 'image-alt', tags: ['wcag111']})],
            incomplete: [
              createMockAxeRule({id: 'button-name', tags: ['wcag412']}),
            ],
            inapplicable: [createMockAxeRule({id: 'meta-refresh'})],
          }),
        }) as never
      );

      await runTestRunEnd(reporter);

      const report = getWrittenReport() as {
        components: Array<{
          name: string;
          automated: {
            violations: number;
            passes: number;
            incomplete: number;
            inapplicable: number;
          };
        }>;
      };
      expect(report.components).toHaveLength(1);
      expect(report.components[0]).toMatchObject({
        name: 'atomic-test',
        automated: {
          violations: 1,
          passes: 1,
          incomplete: 1,
          inapplicable: 1,
        },
      });
    });

    it('falls back to error parsing when axe results are not available', async () => {
      const reporter = new VitestA11yReporter();

      const testCase = {
        id: 'storybook-search-atomic-search-box--fallback',
        project: {name: 'storybook'},
        module: {
          moduleId:
            'src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx',
        },
        meta: () => ({
          storyId: 'search-atomic-search-box--fallback',
          reports: [{type: 'a11y', result: null}],
        }),
        result: () => ({
          errors: [
            new Error(
              'toHaveNoViolations failed: https://dequeuniversity.com/rules/axe/4.10/color-contrast'
            ),
          ],
        }),
      };

      reporter.onTestCaseResult(testCase as never);
      await runTestRunEnd(reporter);

      const report = getWrittenReport() as {
        components: Array<{
          automated: {violations: number};
        }>;
      };
      expect(report.components[0]?.automated.violations).toBe(1);
    });

    it('skips non-atomic components', async () => {
      const reporter = new VitestA11yReporter();

      reporter.onTestCaseResult(
        createMockTestCase({
          moduleId:
            'src/components/search/search-box/search-box.new.stories.tsx',
          storyId: 'search-search-box--default',
        }) as never
      );

      await runTestRunEnd(reporter);
      expect(fsPromisesMock.writeFile).not.toHaveBeenCalled();
    });

    it('skips duplicate storyIds for the same component', async () => {
      const reporter = new VitestA11yReporter();
      const duplicateStory = createMockTestCase({
        storyId: 'search-atomic-test--duplicate',
      });

      reporter.onTestCaseResult(duplicateStory as never);
      reporter.onTestCaseResult(duplicateStory as never);

      await runTestRunEnd(reporter);

      const report = getWrittenReport() as {
        components: Array<{
          storyCount: number;
          automated: {violations: number};
        }>;
      };
      expect(report.components[0]).toMatchObject({
        storyCount: 1,
        automated: {violations: 0},
      });
    });

    it('handles processing errors gracefully and warns', () => {
      const reporter = new VitestA11yReporter();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      reporter.onTestCaseResult({
        id: 'storybook-broken-test',
        project: {name: 'storybook'},
        module: {
          moduleId:
            'src/components/search/atomic-test/atomic-test.new.stories.tsx',
        },
        meta: () => {
          throw new Error('meta failure');
        },
      } as never);

      expect(warnSpy).toHaveBeenCalledWith(
        '[VitestA11yReporter] Unable to process Storybook a11y test result.',
        expect.any(Error)
      );
    });

    it('extracts category and framework from story metadata', async () => {
      const reporter = new VitestA11yReporter();

      reporter.onTestCaseResult(
        createMockTestCase({
          moduleId:
            'src/components/commerce/atomic-product/atomic-product.stories.tsx',
          storyId: 'commerce-atomic-product--default',
        }) as never
      );

      await runTestRunEnd(reporter);

      const report = getWrittenReport() as {
        components: Array<{category: string; framework: string}>;
      };
      expect(report.components[0]).toMatchObject({
        category: 'commerce',
        framework: 'stencil',
      });
    });

    it('accumulates multiple tests for the same component', async () => {
      const reporter = new VitestA11yReporter();

      reporter.onTestCaseResult(
        createMockTestCase({
          storyId: 'search-atomic-search-box--default',
          moduleId:
            'src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx',
          axeResults: createMockAxeResults({
            violations: [createMockAxeRule({id: 'color-contrast'})],
          }),
        }) as never
      );

      reporter.onTestCaseResult(
        createMockTestCase({
          storyId: 'search-atomic-search-box--with-passes',
          moduleId:
            'src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx',
          axeResults: createMockAxeResults({
            passes: [createMockAxeRule({id: 'image-alt'})],
          }),
        }) as never
      );

      await runTestRunEnd(reporter);

      const report = getWrittenReport() as {
        components: Array<{
          storyCount: number;
          automated: {violations: number; passes: number};
        }>;
      };
      expect(report.components[0]).toMatchObject({
        storyCount: 2,
        automated: {violations: 1, passes: 1},
      });
    });
  });

  describe('onTestRunEnd()', () => {
    it('does not write a file when no results are accumulated', async () => {
      const reporter = new VitestA11yReporter();

      await runTestRunEnd(reporter);
      expect(fsPromisesMock.writeFile).not.toHaveBeenCalled();
    });

    it('writes valid report JSON when results are accumulated', async () => {
      const reporter = new VitestA11yReporter();
      reporter.onTestCaseResult(createMockTestCase() as never);

      await runTestRunEnd(reporter);

      expect(fsPromisesMock.writeFile).toHaveBeenCalledTimes(1);
      expect(isA11yReport(getWrittenReport())).toBe(true);
    });

    it('writes both base and shard files in shard mode', async () => {
      process.argv = ['node', 'vitest', '--shard=2/3'];
      const reporter = new VitestA11yReporter();
      reporter.onTestCaseResult(createMockTestCase() as never);

      await runTestRunEnd(reporter);

      expect(fsPromisesMock.writeFile).toHaveBeenCalledTimes(2);
      const writePaths = fsPromisesMock.writeFile.mock.calls.map(
        (call) => call[0] as string
      );
      expect(writePaths).toContain(
        path.resolve(
          DEFAULT_A11Y_REPORT_OUTPUT_DIR,
          DEFAULT_A11Y_REPORT_FILENAME
        )
      );
      expect(writePaths).toContain(
        path.resolve(DEFAULT_A11Y_REPORT_OUTPUT_DIR, 'a11y-report.shard-2.json')
      );
    });

    it('warns when writing the report file fails', async () => {
      const reporter = new VitestA11yReporter();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      reporter.onTestCaseResult(createMockTestCase() as never);
      fsPromisesMock.writeFile.mockRejectedValue(new Error('disk full'));

      await runTestRunEnd(reporter);

      expect(warnSpy).toHaveBeenCalledWith(
        '[VitestA11yReporter] Unable to write the accessibility report JSON file.',
        expect.any(Error)
      );
    });

    it('creates output directory recursively before writing files', async () => {
      const reporter = new VitestA11yReporter({outputDir: 'reports/nested'});
      reporter.onTestCaseResult(createMockTestCase() as never);

      await runTestRunEnd(reporter);

      expect(fsPromisesMock.mkdir).toHaveBeenCalledWith('reports/nested', {
        recursive: true,
      });
    });
  });
});
