import {describe, expect, it} from 'vitest';
import {buildOpenAcrReport} from '../openacr/report-builder.js';
import type {
  A11yOverrideEntry,
  ManualAuditAggregate,
} from '../openacr/types.js';
import type {
  A11yComponentReport,
  A11yCriterionReport,
  A11yReport,
} from '../shared/types.js';

function createMockComponent(
  overrides: Partial<A11yComponentReport> = {}
): A11yComponentReport {
  return {
    name: 'atomic-search-box',
    category: 'search',
    framework: 'lit',
    storyCount: 1,
    automated: {
      violations: 0,
      passes: 1,
      incomplete: 0,
      inapplicable: 0,
      criteriaCovered: ['1.1.1'],
      incompleteDetails: [],
    },
    ...overrides,
  };
}

function createMockCriterion(
  overrides: Partial<A11yCriterionReport> = {}
): A11yCriterionReport {
  return {
    id: '1.1.1',
    name: 'Non-text Content',
    level: 'A',
    wcagVersion: '2.0',
    conformance: 'notEvaluated',
    automatedCoverage: true,
    manualVerified: false,
    remarks: '',
    affectedComponents: ['atomic-search-box'],
    ...overrides,
  };
}

function createMockReport(overrides: Partial<A11yReport> = {}): A11yReport {
  return {
    report: {
      product: 'Coveo Atomic',
      version: '3.0.0',
      standard: 'WCAG 2.2 AA',
      reportDate: '2025-02-14',
      evaluationMethods: ['axe-core 4.10.3'],
      axeCoreVersion: '4.10.3',
      storybookVersion: '10.0.8',
    },
    components: [createMockComponent()],
    criteria: [createMockCriterion()],
    summary: {
      totalComponents: 1,
      litComponents: 1,
      stencilComponents: 0,
      stencilExcluded: true,
      storyCoverage: {total: 1, withA11y: 1, excludedFromA11y: 0},
      totalCriteria: 55,
      supports: 0,
      partiallySupports: 0,
      doesNotSupport: 0,
      notApplicable: 0,
      notEvaluated: 55,
      automatedCoverage: '2%',
      manualCoverage: '0%',
    },
    ...overrides,
  };
}

describe('buildOpenAcrReport()', () => {
  it('should build a valid OpenACR report from a11y report input', () => {
    const report = createMockReport();
    const overrides = new Map<string, A11yOverrideEntry>();
    const manualAggregates = new Map<string, ManualAuditAggregate[]>();

    const result = buildOpenAcrReport(report, overrides, manualAggregates);

    expect(result.title).toBe('Coveo Accessibility Conformance Report');
    expect(result.product.name).toBe('Coveo Atomic');
    expect(result.product.version).toBe('3.0.0');
    expect(result.report_date).toBe('2025-02-14');
    expect(result.summary.total_criteria).toBeGreaterThan(0);
  });

  it('should populate Level A and Level AA chapters', () => {
    const report = createMockReport();
    const result = buildOpenAcrReport(report, new Map(), new Map());

    expect(
      result.chapters.success_criteria_level_a.criteria.length
    ).toBeGreaterThan(0);
    expect(
      result.chapters.success_criteria_level_aa.criteria.length
    ).toBeGreaterThan(0);
    expect(result.chapters.success_criteria_level_aaa.disabled).toBe(true);
  });

  it('should count automated covered criteria in summary', () => {
    const report = createMockReport();
    const result = buildOpenAcrReport(report, new Map(), new Map());

    expect(result.summary.automated_covered_criteria).toBeGreaterThan(0);
  });

  it('should handle null report input with defaults', () => {
    const result = buildOpenAcrReport(null, new Map(), new Map());

    expect(result.title).toBe('Coveo Accessibility Conformance Report');
    expect(result.product.name).toBe('Coveo Atomic');
    expect(result.product.version).toBe('3.x.x');
    expect(result.summary.total_criteria).toBeGreaterThan(0);
    expect(result.summary.automated_covered_criteria).toBe(0);
  });

  it('should apply override conformance to matching criteria', () => {
    const report = createMockReport();
    const overrides = new Map<string, A11yOverrideEntry>([
      [
        '1.1.1',
        {
          criterion: '1.1.1',
          conformance: 'not-applicable',
          reason: 'Not relevant',
        },
      ],
    ]);

    const result = buildOpenAcrReport(report, overrides, new Map());

    const allCriteria = [
      ...result.chapters.success_criteria_level_a.criteria,
      ...result.chapters.success_criteria_level_aa.criteria,
    ];
    const criterion = allCriteria.find((c) => c.num === '1.1.1');

    expect(criterion?.conformance).toBe('not-applicable');
    expect(criterion?.remarks).toContain('[Override]');
    expect(criterion?.remarks).toContain('Not relevant');
  });

  it('should apply manual audit conformance when manual aggregates exist', () => {
    const report = createMockReport();
    const manualAggregates = new Map<string, ManualAuditAggregate[]>([
      [
        'atomic-search-box:1.1.1',
        [
          {
            componentName: 'atomic-search-box',
            criterionId: '1.1.1',
            conformance: 'supports',
          },
        ],
      ],
    ]);

    const result = buildOpenAcrReport(report, new Map(), manualAggregates);

    const allCriteria = [
      ...result.chapters.success_criteria_level_a.criteria,
      ...result.chapters.success_criteria_level_aa.criteria,
    ];
    const criterion = allCriteria.find((c) => c.num === '1.1.1');

    expect(criterion?.conformance).toBe('supports');
    expect(criterion?.manual_result.status).toBe('evaluated');
  });

  it('should set manual_result status to not-evaluated when no manual data', () => {
    const report = createMockReport();
    const result = buildOpenAcrReport(report, new Map(), new Map());

    const allCriteria = [
      ...result.chapters.success_criteria_level_a.criteria,
      ...result.chapters.success_criteria_level_aa.criteria,
    ];

    for (const criterion of allCriteria) {
      expect(criterion.manual_result.status).toBe('not-evaluated');
    }
  });

  it('should include evaluation methods from report and append manual audit pending note', () => {
    const report = createMockReport();
    const result = buildOpenAcrReport(report, new Map(), new Map());

    expect(result.evaluation_methods_used).toContain('axe-core 4.10.3');
    expect(result.evaluation_methods_used).toContain(
      'manual audit placeholders pending'
    );
  });

  it('should include Manual audit in evaluation methods when manual aggregates exist', () => {
    const report = createMockReport();
    const manualAggregates = new Map<string, ManualAuditAggregate[]>([
      [
        'atomic-search-box:1.1.1',
        [
          {
            componentName: 'atomic-search-box',
            criterionId: '1.1.1',
            conformance: 'supports',
          },
        ],
      ],
    ]);

    const result = buildOpenAcrReport(report, new Map(), manualAggregates);

    expect(result.evaluation_methods_used).toContain('Manual audit');
  });

  it('should build criterion components for covered components', () => {
    const report = createMockReport();
    const result = buildOpenAcrReport(report, new Map(), new Map());

    const allCriteria = [
      ...result.chapters.success_criteria_level_a.criteria,
      ...result.chapters.success_criteria_level_aa.criteria,
    ];
    const criterion = allCriteria.find((c) => c.num === '1.1.1');

    expect(criterion?.components.length).toBeGreaterThan(0);
    expect(criterion?.components[0].adherence.level).toBeDefined();
  });

  it('should fallback to "web" component when no components cover a criterion', () => {
    const report = createMockReport({
      components: [],
      criteria: [],
    });

    const result = buildOpenAcrReport(report, new Map(), new Map());

    const allCriteria = [
      ...result.chapters.success_criteria_level_a.criteria,
      ...result.chapters.success_criteria_level_aa.criteria,
    ];

    // Criteria with no component coverage should use 'web' as component name
    const uncoveredCriterion = allCriteria[0];
    expect(uncoveredCriterion.components).toHaveLength(1);
    expect(uncoveredCriterion.components[0].name).toBe('web');
  });

  it('should track violating components in automated_result', () => {
    const report = createMockReport({
      components: [
        createMockComponent({
          name: 'atomic-search-box',
          automated: {
            violations: 2,
            passes: 1,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: ['1.1.1'],
            incompleteDetails: [],
          },
        }),
      ],
      criteria: [
        createMockCriterion({
          id: '1.1.1',
          affectedComponents: ['atomic-search-box'],
        }),
      ],
    });

    const result = buildOpenAcrReport(report, new Map(), new Map());

    const allCriteria = [
      ...result.chapters.success_criteria_level_a.criteria,
      ...result.chapters.success_criteria_level_aa.criteria,
    ];
    const criterion = allCriteria.find((c) => c.num === '1.1.1');

    expect(criterion?.automated_result.violating_components).toContain(
      'atomic-search-box'
    );
    expect(criterion?.automated_result.status).toBe('covered-with-violations');
  });
});
