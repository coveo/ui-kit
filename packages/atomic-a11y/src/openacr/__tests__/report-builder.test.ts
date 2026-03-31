import {describe, expect, it} from 'vitest';
import {DEFAULT_MANUAL_PLACEHOLDER_NOTE} from '../../shared/constants.js';
import type {
  A11yComponentReport,
  A11yCriterionReport,
  A11yReport,
} from '../../shared/types.js';
import {buildOpenAcrReport} from '../report-builder.js';
import type {
  A11yOverrideEntry,
  ManualAuditAggregate,
  OpenAcrReport,
} from '../types.js';

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
      passes: 1,
      incomplete: 0,
      inapplicable: 0,
      criteriaCovered: ['1.1.1'],
      incompleteDetails: [],
    },
    ...overrides,
  };
}

function createCriterion(
  overrides: Partial<A11yCriterionReport> = {}
): A11yCriterionReport {
  return {
    id: '1.1.1',
    name: 'Non-text Content',
    level: 'A',
    wcagVersion: '2.2',
    conformance: 'notEvaluated',
    automatedCoverage: true,
    interactiveCoverage: false,
    manualVerified: false,
    remarks: '',
    affectedComponents: [],
    ...overrides,
  };
}

function createMinimalReport(
  components: A11yComponentReport[],
  criteria: A11yCriterionReport[]
): A11yReport {
  return {
    report: {
      evaluationMethods: ['axe-core Storybook scans'],
      product: 'Coveo Atomic',
      version: '3.x.x',
      standard: 'WCAG 2.2 AA',
      reportDate: '2026-03-30',
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
        total: components.reduce(
          (sum, component) => sum + component.storyCount,
          0
        ),
        withA11y: components.reduce(
          (sum, component) => sum + component.storyCount,
          0
        ),
        excludedFromA11y: 0,
      },
      totalCriteria: 55,
      supports: 0,
      partiallySupports: 0,
      doesNotSupport: 0,
      notApplicable: 0,
      notEvaluated: 55,
      automatedCoverage: '0%',
      interactiveCoverage: '0%',
      interactivePassRate: '0%',
      manualCoverage: '0%',
    },
  };
}

function getCriterion(report: OpenAcrReport, criterionId: string) {
  return [
    ...report.chapters.success_criteria_level_a.criteria,
    ...report.chapters.success_criteria_level_aa.criteria,
  ].find((criterion) => criterion.num === criterionId);
}

describe('buildOpenAcrReport()', () => {
  it('should build automated-only conformance and remarks when interactive data is absent', () => {
    const report = createMinimalReport(
      [createComponent()],
      [createCriterion()]
    );

    const openAcrReport = buildOpenAcrReport(
      report,
      new Map<string, A11yOverrideEntry>(),
      new Map<string, ManualAuditAggregate[]>()
    );

    expect(
      getCriterion(openAcrReport, '1.1.1')?.components[0].adherence
    ).toEqual({
      level: 'supports',
      notes: `Automated testing found no axe-core violations for WCAG 1.1.1 across 1 mapped component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`,
    });
  });

  it('should apply interactive conformance for criterion with interactive coverage', () => {
    const report = createMinimalReport(
      [
        createComponent({
          interactive: {
            criteriaCovered: ['1.1.1'],
            testCount: 1,
            passedCount: 1,
            failedCount: 0,
            failedCriteria: [],
          },
        }),
      ],
      [createCriterion()]
    );

    const openAcrReport = buildOpenAcrReport(
      report,
      new Map<string, A11yOverrideEntry>(),
      new Map<string, ManualAuditAggregate[]>()
    );

    expect(
      getCriterion(openAcrReport, '1.1.1')?.components[0].adherence.level
    ).toBe('supports');
  });

  it('should return partially-supports when interactive data has partial failures', () => {
    const report = createMinimalReport(
      [
        createComponent({
          name: 'atomic-search-box',
          interactive: {
            criteriaCovered: ['1.1.1'],
            testCount: 1,
            passedCount: 1,
            failedCount: 0,
            failedCriteria: [],
          },
        }),
        createComponent({
          name: 'atomic-facet',
          automated: {
            violations: 0,
            passes: 1,
            incomplete: 0,
            inapplicable: 0,
            criteriaCovered: ['1.1.1'],
            incompleteDetails: [],
          },
          interactive: {
            criteriaCovered: ['1.1.1'],
            testCount: 1,
            passedCount: 0,
            failedCount: 1,
            failedCriteria: ['1.1.1'],
          },
        }),
      ],
      [createCriterion()]
    );

    const openAcrReport = buildOpenAcrReport(
      report,
      new Map<string, A11yOverrideEntry>(),
      new Map<string, ManualAuditAggregate[]>()
    );

    expect(
      getCriterion(openAcrReport, '1.1.1')?.components[0].adherence.level
    ).toBe('partially-supports');
  });

  it('should prioritize interactive pass over automated violations for the same criterion', () => {
    const report = createMinimalReport(
      [
        createComponent({
          interactive: {
            criteriaCovered: ['1.1.1'],
            testCount: 1,
            passedCount: 1,
            failedCount: 0,
            failedCriteria: [],
          },
        }),
      ],
      [
        createCriterion({
          id: '1.1.1',
          affectedComponents: ['atomic-search-box'],
        }),
      ]
    );

    const openAcrReport = buildOpenAcrReport(
      report,
      new Map<string, A11yOverrideEntry>(),
      new Map<string, ManualAuditAggregate[]>()
    );

    expect(
      getCriterion(openAcrReport, '1.1.1')?.components[0].adherence.level
    ).toBe('supports');
  });

  it('should include interactive keyboard and screen-reader wording in chapter notes', () => {
    const report = createMinimalReport(
      [createComponent()],
      [createCriterion()]
    );

    const openAcrReport = buildOpenAcrReport(
      report,
      new Map<string, A11yOverrideEntry>(),
      new Map<string, ManualAuditAggregate[]>()
    );

    expect(openAcrReport.chapters.success_criteria_level_a.notes).toContain(
      'interactive keyboard/screen-reader testing'
    );
  });

  it('should prioritize overrides over interactive conformance', () => {
    const report = createMinimalReport(
      [
        createComponent({
          interactive: {
            criteriaCovered: ['1.1.1'],
            testCount: 1,
            passedCount: 1,
            failedCount: 0,
            failedCriteria: [],
          },
        }),
      ],
      [createCriterion()]
    );

    const overrides = new Map<string, A11yOverrideEntry>([
      [
        '1.1.1',
        {
          criterion: '1.1.1',
          conformance: 'does-not-support',
          reason: 'Accessibility sign-off blocked pending remediation',
        },
      ],
    ]);

    const openAcrReport = buildOpenAcrReport(
      report,
      overrides,
      new Map<string, ManualAuditAggregate[]>()
    );

    expect(
      getCriterion(openAcrReport, '1.1.1')?.components[0].adherence
    ).toEqual({
      level: 'does-not-support',
      notes: '[Override] Accessibility sign-off blocked pending remediation',
    });
  });
});
