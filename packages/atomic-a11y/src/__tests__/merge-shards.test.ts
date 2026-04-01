import {describe, expect, it} from 'vitest';
import {mergeComponents, mergeCriteria} from '../reporter/merge-shards.js';
import {createSummary} from '../reporter/summary.js';
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
    interactiveCoverage: false,
    manualVerified: false,
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
      interactiveCoverage: '0%',
      interactivePassRate: '0%',
      manualCoverage: '0%',
    },
  };
}

describe('mergeComponents()', () => {
  it('should merge automated counts for the same component across shards', () => {
    const firstReport = createReport(
      [
        createComponent({
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

    const merged = mergeComponents([firstReport, secondReport]);

    expect(merged).toHaveLength(1);
    expect(merged[0].automated.violations).toBe(1);
    expect(merged[0].automated.passes).toBe(2);
    expect(merged[0].automated.incomplete).toBe(1);
    expect(merged[0].automated.inapplicable).toBe(0);
  });

  it('should sum storyCount across shards for the same component', () => {
    const firstReport = createReport([createComponent({storyCount: 1})], []);
    const secondReport = createReport([createComponent({storyCount: 2})], []);

    const merged = mergeComponents([firstReport, secondReport]);

    expect(merged).toHaveLength(1);
    expect(merged[0].storyCount).toBe(3);
  });

  it('should deduplicate and sort criteriaCovered across shards', () => {
    const firstReport = createReport(
      [
        createComponent({
          automated: {
            violations: 0,
            passes: 0,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: ['1.4.3', '1.1.1'],
            incompleteDetails: [],
          },
        }),
      ],
      []
    );
    const secondReport = createReport(
      [
        createComponent({
          automated: {
            violations: 0,
            passes: 0,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: ['1.1.1', '2.4.1'],
            incompleteDetails: [],
          },
        }),
      ],
      []
    );

    const merged = mergeComponents([firstReport, secondReport]);

    expect(merged[0].automated.criteriaCovered).toEqual([
      '1.1.1',
      '1.4.3',
      '2.4.1',
    ]);
  });

  it('should keep distinct components separate', () => {
    const report = createReport(
      [
        createComponent({name: 'atomic-search-box'}),
        createComponent({name: 'atomic-result-list'}),
      ],
      []
    );

    const merged = mergeComponents([report]);

    expect(merged).toHaveLength(2);
  });

  it('should sort merged components alphabetically by name', () => {
    const report = createReport(
      [
        createComponent({name: 'atomic-result-list'}),
        createComponent({name: 'atomic-facet'}),
        createComponent({name: 'atomic-search-box'}),
      ],
      []
    );

    const merged = mergeComponents([report]);

    expect(merged.map((c) => c.name)).toEqual([
      'atomic-facet',
      'atomic-result-list',
      'atomic-search-box',
    ]);
  });

  it('should return empty array when all reports have no components', () => {
    const report = createReport([], []);

    const merged = mergeComponents([report]);

    expect(merged).toEqual([]);
  });
});

describe('mergeCriteria()', () => {
  it('should merge affectedComponents from multiple shards for the same criterion', () => {
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
    ];

    const merged = mergeCriteria([firstReport, secondReport], mergedComponents);

    const criterion143 = merged.find((criterion) => criterion.id === '1.4.3');
    expect(criterion143?.affectedComponents).toEqual([
      'atomic-result-list',
      'atomic-search-box',
    ]);
  });

  it('should infer new criteria from component coverage not present in shard criteria', () => {
    const report = createReport(
      [
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
      ],
      []
    );

    const merged = mergeCriteria([report], report.components);

    const criterion241 = merged.find((criterion) => criterion.id === '2.4.1');
    expect(criterion241).toMatchObject({
      id: '2.4.1',
      name: 'Bypass Blocks',
      level: 'A',
      conformance: 'notEvaluated',
    });
  });

  it('should sort merged criteria by numeric ID', () => {
    const report = createReport(
      [
        createComponent({
          automated: {
            violations: 0,
            passes: 0,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: ['4.1.2', '1.1.1', '2.4.1'],
            incompleteDetails: [],
          },
        }),
      ],
      [
        createCriterion({id: '4.1.2', name: 'Name, Role, Value'}),
        createCriterion({id: '1.1.1', name: 'Non-text Content'}),
        createCriterion({id: '2.4.1', name: 'Bypass Blocks'}),
      ]
    );

    const merged = mergeCriteria([report], report.components);

    expect(merged.map((c) => c.id)).toEqual(['1.1.1', '2.4.1', '4.1.2']);
  });

  it('should sort affectedComponents alphabetically within each criterion', () => {
    const report = createReport(
      [
        createComponent({name: 'atomic-search-box'}),
        createComponent({name: 'atomic-facet'}),
      ],
      [
        createCriterion({
          affectedComponents: ['atomic-search-box', 'atomic-facet'],
        }),
      ]
    );

    const merged = mergeCriteria([report], report.components);

    expect(merged[0].affectedComponents).toEqual([
      'atomic-facet',
      'atomic-search-box',
    ]);
  });

  it('should return empty array when no criteria exist in shards or components', () => {
    const report = createReport([], []);

    const merged = mergeCriteria([report], []);

    expect(merged).toEqual([]);
  });
});

describe('createSummary() integration with merge-shards', () => {
  it('should build consistent summary from merged components and criteria', () => {
    const components = [
      createComponent({name: 'atomic-a', storyCount: 2}),
      createComponent({name: 'atomic-b', storyCount: 3}),
    ];
    const criteria = [
      createCriterion({id: '1.1.1'}),
      createCriterion({id: '1.3.1'}),
      createCriterion({id: '1.4.3'}),
      createCriterion({id: '2.4.1'}),
    ];

    const summary = createSummary(components, criteria);

    expect(summary.totalComponents).toBe(2);
    expect(summary.automatedCoverage).toBe('7%');
  });

  it('should compute storyCoverage from merged component storyCount', () => {
    const components = [
      createComponent({name: 'atomic-a', storyCount: 2}),
      createComponent({name: 'atomic-b', storyCount: 3}),
    ];

    const summary = createSummary(components, []);

    expect(summary.storyCoverage).toEqual({
      total: 5,
      withA11y: 5,
      excludedFromA11y: 0,
    });
  });
});
