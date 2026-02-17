import {describe, expect, it} from 'vitest';
import {
  extractCriteriaFromTags,
  getCriteriaForRule,
} from '../reporter/axe-integration.js';
import {stripAnsiSequences} from '../reporter/error-parsing.js';
import {buildA11yReport} from '../reporter/report-builder.js';
import {
  type ComponentAccumulator,
  formatDate,
  getAutomationCoveragePercentage,
} from '../reporter/reporter-utils.js';
import {
  extractCategory,
  extractComponentName,
  extractFramework,
} from '../reporter/storybook-extraction.js';
import {VitestA11yReporter} from '../reporter/vitest-a11y-reporter.js';

function createRule(id: string, tags: string[] = []): Record<string, unknown> {
  return {
    id,
    tags,
    impact: 'moderate',
    description: `${id} description`,
    help: `${id} help`,
    helpUrl: `https://example.com/${id}`,
    nodes: [
      {
        all: [],
        any: [
          {
            id: `${id}-check`,
            data: null,
            impact: 'moderate',
            message: `${id} message`,
            relatedNodes: [],
          },
        ],
        none: [],
        html: `<div data-rule="${id}"></div>`,
        target: ['div'],
        failureSummary: `${id} failure summary`,
      },
    ],
  };
}

describe('vitest-a11y-reporter test utilities', () => {
  it('extractComponentName() extracts atomic component names from module path', () => {
    expect(
      extractComponentName(
        'src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx',
        'search-atomic-search-box--default'
      )
    ).toBe('atomic-search-box');

    expect(
      extractComponentName(
        'src/stories/fallback.stories.tsx',
        'search-atomic-result-list'
      )
    ).toBe('atomic-result-list');
  });

  it('extractCategory() extracts expected category values', () => {
    expect(
      extractCategory(
        'src/components/commerce/atomic-product/atomic-product.new.stories.tsx',
        'commerce-atomic-product--default'
      )
    ).toBe('commerce');

    expect(
      extractCategory(
        'src/stories/misc.stories.tsx',
        'search-atomic-search-box--default'
      )
    ).toBe('search');
  });

  it('extractFramework() detects lit and stencil stories', () => {
    expect(
      extractFramework(
        'src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx'
      )
    ).toBe('lit');

    expect(
      extractFramework(
        'src/components/search/atomic-search-box/atomic-search-box.stories.tsx'
      )
    ).toBe('stencil');
  });

  it('getCriteriaForRule() maps axe rules to WCAG criteria', () => {
    const criteria = getCriteriaForRule(
      createRule('color-contrast', ['wcag131']) as never
    );

    expect(criteria).toEqual(['1.3.1', '1.4.3']);
  });

  it('extractCriteriaFromTags() parses wcag tags', () => {
    expect(
      extractCriteriaFromTags(['wcag143', 'wcag412', 'best-practice'])
    ).toEqual(['1.4.3', '4.1.2']);
  });

  it('stripAnsiSequences() removes ANSI escape codes', () => {
    expect(stripAnsiSequences('\u001B[31mError\u001B[39m occurred')).toBe(
      'Error occurred'
    );
  });

  it('formatDate() formats date as YYYY-MM-DD', () => {
    expect(formatDate(new Date('2025-02-17T10:00:00.000Z'))).toBe('2025-02-17');
  });

  it('getAutomationCoveragePercentage() returns rounded percentage strings', () => {
    expect(getAutomationCoveragePercentage(7, 50)).toBe('14%');
    expect(getAutomationCoveragePercentage(1, 0)).toBe('0%');
  });
});

describe('VitestA11yReporter buildReport integration', () => {
  it('builds a report from captured storybook axe results', () => {
    const reporter = new VitestA11yReporter({totalCriteria: 10});

    const axeResults = {
      violations: [createRule('color-contrast', ['wcag143'])],
      passes: [createRule('image-alt', ['wcag111'])],
      incomplete: [createRule('button-name', ['wcag412'])],
      inapplicable: [createRule('meta-refresh')],
    };

    const mockTestCase = {
      id: 'storybook-search-atomic-search-box--default',
      project: {name: 'storybook'},
      module: {
        moduleId:
          'src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx',
      },
      meta: () => ({
        storyId: 'search-atomic-search-box--default',
        reports: [{type: 'a11y', result: axeResults}],
      }),
      result: {
        errors: [],
      },
    };

    reporter.onTestResult(mockTestCase as never);

    const componentResults = (
      reporter as unknown as {
        componentResults: Map<string, ComponentAccumulator>;
      }
    ).componentResults;
    const report = buildA11yReport(componentResults, 10, {
      devDependencies: {'axe-core': '4.10.0', storybook: '8.0.0'},
    });

    expect(report.components).toHaveLength(1);
    expect(report.components[0]).toMatchObject({
      name: 'atomic-search-box',
      category: 'search',
      framework: 'lit',
      storyCount: 1,
    });
    expect(report.components[0].automated).toMatchObject({
      violations: 1,
      passes: 1,
      incomplete: 1,
      inapplicable: 1,
    });
    expect(report.summary.totalComponents).toBe(1);
    expect(report.summary.automatedCoverage).toMatch(/%$/);
    expect(report.report.evaluationMethods).toContain('Manual audit');
    expect(report.criteria.map((criterion) => criterion.id)).toContain('1.4.3');
  });
});
