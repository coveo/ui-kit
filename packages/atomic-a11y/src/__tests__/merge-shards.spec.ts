import {describe, expect, it} from 'vitest';
import {mergeShardsTestUtils} from '../reporter/merge-shards.js';
import type {
  A11yComponentReport,
  A11yCriterionReport,
  A11yReport,
} from '../shared/types.js';

function createComponent(
  overrides: Partial<A11yComponentReport> = {}
): A11yComponentReport {
  return {
    name: 'atomic-search-box',
    category: 'search',
    framework: 'lit',
    storyCount: 1,
    automated: {
      violations: 0,
      passes: 0,
      incomplete: 0,
      inapplicable: 0,
      criteriaCovered: [],
      incompleteDetails: [],
    },
    ...overrides,
  };
}

function createCriterion(
  overrides: Partial<A11yCriterionReport> = {}
): A11yCriterionReport {
  return {
    id: '1.4.3',
    name: 'Contrast (Minimum)',
    level: 'AA',
    wcagVersion: '2.0',
    conformance: 'notEvaluated',
    automatedCoverage: true,
    manualVerified: false,
    remarks: '',
    affectedComponents: [],
    ...overrides,
  };
}

function createReport(
  components: A11yComponentReport[],
  criteria: A11yCriterionReport[]
): A11yReport {
  return {
    report: {
      product: 'Coveo Atomic',
      version: '3.x.x',
      standard: 'WCAG 2.2 AA',
      reportDate: '2025-01-01',
      evaluationMethods: ['axe-core'],
      axeCoreVersion: '4.10.3',
      storybookVersion: '10.0.8',
    },
    components,
    criteria,
    summary: {
      totalComponents: components.length,
      litComponents: components.filter(
        (component) => component.framework === 'lit'
      ).length,
      stencilComponents: components.filter(
        (component) => component.framework === 'stencil'
      ).length,
      stencilExcluded: true,
      storyCoverage: {
        total: 0,
        withA11y: 0,
        excludedFromA11y: 0,
      },
      totalCriteria: 50,
      supports: 0,
      partiallySupports: 0,
      doesNotSupport: 0,
      notApplicable: 0,
      notEvaluated: 50,
      automatedCoverage: '0%',
      manualCoverage: '0%',
    },
  };
}

describe('merge-shards test utilities', () => {
  it('mergeComponents() merges component data from multiple shards', () => {
    const firstReport = createReport(
      [
        createComponent({
          category: 'unknown',
          framework: 'unknown',
          storyCount: 1,
          automated: {
            violations: 1,
            passes: 0,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: ['1.4.3'],
            incompleteDetails: [],
          },
        }),
      ],
      []
    );

    const secondReport = createReport(
      [
        createComponent({
          category: 'search',
          framework: 'lit',
          storyCount: 2,
          automated: {
            violations: 0,
            passes: 2,
            incomplete: 1,
            inapplicable: 0,
            criteriaCovered: ['1.1.1'],
            incompleteDetails: [],
          },
        }),
      ],
      []
    );

    const merged = mergeShardsTestUtils.mergeComponents([
      firstReport,
      secondReport,
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      name: 'atomic-search-box',
      category: 'search',
      framework: 'lit',
      storyCount: 3,
    });
    expect(merged[0].automated).toMatchObject({
      violations: 1,
      passes: 2,
      incomplete: 1,
      inapplicable: 0,
    });
    expect(merged[0].automated.criteriaCovered).toEqual(['1.1.1', '1.4.3']);
  });

  it('mergeCriteria() merges criterion data and inferred coverage', () => {
    const firstReport = createReport(
      [
        createComponent({
          name: 'atomic-search-box',
          automated: {
            violations: 0,
            passes: 1,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: ['1.4.3'],
            incompleteDetails: [],
          },
        }),
      ],
      [createCriterion({affectedComponents: ['atomic-search-box']})]
    );

    const secondReport = createReport(
      [
        createComponent({
          name: 'atomic-result-list',
          automated: {
            violations: 0,
            passes: 1,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: ['1.4.3'],
            incompleteDetails: [],
          },
        }),
      ],
      [createCriterion({affectedComponents: ['atomic-result-list']})]
    );

    const mergedComponents: A11yComponentReport[] = [
      ...firstReport.components,
      ...secondReport.components,
      createComponent({
        name: 'atomic-facet',
        automated: {
          violations: 0,
          passes: 1,
          incomplete: 0,
          inapplicable: 0,
          criteriaCovered: ['2.4.1'],
          incompleteDetails: [],
        },
      }),
    ];

    const merged = mergeShardsTestUtils.mergeCriteria(
      [firstReport, secondReport],
      mergedComponents
    );

    const criterion143 = merged.find((criterion) => criterion.id === '1.4.3');
    const criterion241 = merged.find((criterion) => criterion.id === '2.4.1');

    expect(criterion143?.affectedComponents).toEqual([
      'atomic-result-list',
      'atomic-search-box',
    ]);
    expect(criterion241).toMatchObject({
      id: '2.4.1',
      name: '2.4.1',
      level: 'unknown',
      conformance: 'notEvaluated',
    });
  });

  it('createSummary() builds consistent summary statistics', () => {
    const components = [
      createComponent({name: 'atomic-a', framework: 'lit', storyCount: 2}),
      createComponent({name: 'atomic-b', framework: 'stencil', storyCount: 3}),
    ];
    const criteria = [
      createCriterion({id: '1.1.1'}),
      createCriterion({id: '1.3.1'}),
      createCriterion({id: '1.4.3'}),
      createCriterion({id: '2.4.1'}),
    ];

    const summary = mergeShardsTestUtils.createSummary(
      components,
      criteria,
      10
    );

    expect(summary).toMatchObject({
      totalComponents: 2,
      litComponents: 1,
      stencilComponents: 1,
      totalCriteria: 10,
      automatedCoverage: '40%',
    });
    expect(summary.storyCoverage).toEqual({
      total: 5,
      withA11y: 5,
      excludedFromA11y: 0,
    });
  });
});
