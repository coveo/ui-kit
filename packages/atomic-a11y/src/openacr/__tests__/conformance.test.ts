import {describe, expect, it} from 'vitest';
import {DEFAULT_MANUAL_PLACEHOLDER_NOTE} from '../../shared/constants.js';
import type {A11yCriterionReport} from '../../shared/types.js';
import {buildRemarks, resolveConformance} from '../conformance.js';
import type {
  A11yOverrideEntry,
  CriterionAggregate,
  InteractiveAggregate,
  ManualAuditAggregate,
} from '../types.js';

type ResolveConformanceContext = Parameters<typeof resolveConformance>[0];
type BuildRemarksContext = Parameters<typeof buildRemarks>[0];

function createCriterion(
  conformance: A11yCriterionReport['conformance']
): A11yCriterionReport {
  return {
    id: '1.1.1',
    name: 'Non-text Content',
    level: 'A',
    wcagVersion: '2.2',
    conformance,
    automatedCoverage: true,
    interactiveCoverage: false,
    manualVerified: false,
    remarks: '',
    affectedComponents: [],
  };
}

function withInteractive(
  covered: string[],
  failed: string[]
): InteractiveAggregate {
  const failedSet = new Set(failed);
  return {
    coveredComponents: new Set(covered),
    passedComponents: new Set(
      covered.filter((component) => !failedSet.has(component))
    ),
    failedComponents: failedSet,
  };
}

function withAggregate(
  covered: string[],
  violating: string[]
): CriterionAggregate {
  return {
    coveredComponents: new Set(covered),
    violatingComponents: new Set(violating),
  };
}

function emptyContext(): BuildRemarksContext {
  return {
    criterion: undefined,
    aggregate: undefined,
    interactiveAggregate: undefined,
    manualAggregates: undefined,
    override: undefined,
    criterionId: '1.1.1',
    conformance: 'not-evaluated',
    coveredComponents: [],
    violatingComponents: [],
    interactiveCoveredComponents: [],
    interactiveFailedComponents: [],
  };
}

describe('resolveConformance()', () => {
  it('should return override conformance when override is present', () => {
    const override: A11yOverrideEntry = {
      criterion: '1.1.1',
      conformance: 'not-applicable',
      reason: 'Explicit product exception',
    };

    const result = resolveConformance({
      ...(emptyContext() as ResolveConformanceContext),
      override,
      manualAggregates: [
        {
          componentName: 'atomic-search-box',
          criterionId: '1.1.1',
          conformance: 'supports',
        },
      ],
      interactiveAggregate: withInteractive(
        ['atomic-search-box'],
        ['atomic-search-box']
      ),
      aggregate: withAggregate(['atomic-search-box'], ['atomic-search-box']),
    });

    expect(result).toBe('not-applicable');
  });

  it('should return manual conformance when manual aggregates exist and no override', () => {
    const manualAggregates: ManualAuditAggregate[] = [
      {
        componentName: 'atomic-search-box',
        criterionId: '1.1.1',
        conformance: 'partially-supports',
      },
    ];

    const result = resolveConformance({
      ...(emptyContext() as ResolveConformanceContext),
      manualAggregates,
      interactiveAggregate: withInteractive(['atomic-search-box'], []),
      aggregate: withAggregate(['atomic-search-box'], ['atomic-search-box']),
    });

    expect(result).toBe('partially-supports');
  });

  it('should return interactive supports when all interactive components pass', () => {
    const result = resolveConformance({
      ...(emptyContext() as ResolveConformanceContext),
      interactiveAggregate: withInteractive(
        ['atomic-search-box', 'atomic-facet'],
        []
      ),
    });

    expect(result).toBe('supports');
  });

  it('should return interactive partially-supports when some interactive components fail', () => {
    const result = resolveConformance({
      ...(emptyContext() as ResolveConformanceContext),
      interactiveAggregate: withInteractive(
        ['atomic-search-box', 'atomic-facet'],
        ['atomic-search-box']
      ),
    });

    expect(result).toBe('partially-supports');
  });

  it('should return interactive does-not-support when all interactive components fail', () => {
    const result = resolveConformance({
      ...(emptyContext() as ResolveConformanceContext),
      interactiveAggregate: withInteractive(
        ['atomic-search-box', 'atomic-facet'],
        ['atomic-search-box', 'atomic-facet']
      ),
    });

    expect(result).toBe('does-not-support');
  });

  it('should fall through interactive and use criterion conformance when no interactive coverage', () => {
    const result = resolveConformance({
      ...(emptyContext() as ResolveConformanceContext),
      interactiveAggregate: withInteractive([], []),
      criterion: createCriterion('supports'),
    });

    expect(result).toBe('supports');
  });

  it('should fall through to automated when no override manual interactive or criterion data exists', () => {
    const result = resolveConformance({
      ...(emptyContext() as ResolveConformanceContext),
    });

    expect(result).toBe('not-evaluated');
  });

  it('should prioritize override over manual interactive and automated', () => {
    const result = resolveConformance({
      ...(emptyContext() as ResolveConformanceContext),
      override: {
        criterion: '1.1.1',
        conformance: 'supports',
        reason: 'Business-approved override',
      },
      manualAggregates: [
        {
          componentName: 'atomic-search-box',
          criterionId: '1.1.1',
          conformance: 'does-not-support',
        },
      ],
      interactiveAggregate: withInteractive(
        ['atomic-search-box'],
        ['atomic-search-box']
      ),
      aggregate: withAggregate(['atomic-search-box'], ['atomic-search-box']),
    });

    expect(result).toBe('supports');
  });

  it('should prioritize manual over interactive and automated when no override', () => {
    const result = resolveConformance({
      ...(emptyContext() as ResolveConformanceContext),
      manualAggregates: [
        {
          componentName: 'atomic-search-box',
          criterionId: '1.1.1',
          conformance: 'supports',
        },
      ],
      interactiveAggregate: withInteractive(
        ['atomic-search-box'],
        ['atomic-search-box']
      ),
      aggregate: withAggregate(['atomic-search-box'], ['atomic-search-box']),
    });

    expect(result).toBe('supports');
  });

  it('should prioritize interactive over criterion and automated when no override or manual', () => {
    const result = resolveConformance({
      ...(emptyContext() as ResolveConformanceContext),
      interactiveAggregate: withInteractive(['atomic-search-box'], []),
      criterion: createCriterion('doesNotSupport'),
      aggregate: withAggregate(['atomic-search-box'], ['atomic-search-box']),
    });

    expect(result).toBe('supports');
  });
});

describe('buildRemarks()', () => {
  it('should return override remarks with override prefix', () => {
    const result = buildRemarks({
      ...emptyContext(),
      override: {
        criterion: '1.1.1',
        conformance: 'supports',
        reason: 'Manually validated by accessibility team',
      },
    });

    expect(result).toBe('[Override] Manually validated by accessibility team');
  });

  it('should return manual audit remarks summary', () => {
    const result = buildRemarks({
      ...emptyContext(),
      manualAggregates: [
        {
          componentName: 'atomic-search-box',
          criterionId: '1.1.1',
          conformance: 'supports',
        },
        {
          componentName: 'atomic-facet',
          criterionId: '1.1.1',
          conformance: 'does-not-support',
        },
      ],
    });

    expect(result).toBe('Manual audit: 1 pass, 1 fail across 2 component(s).');
  });

  it('should return interactive pass remarks with automated suffix', () => {
    const result = buildRemarks({
      ...emptyContext(),
      criterionId: '2.1.1',
      conformance: 'supports',
      interactiveAggregate: withInteractive(
        ['atomic-search-box', 'atomic-facet'],
        []
      ),
      interactiveCoveredComponents: ['atomic-search-box', 'atomic-facet'],
      interactiveFailedComponents: [],
      coveredComponents: ['atomic-search-box', 'atomic-facet'],
      violatingComponents: [],
    });

    expect(result).toBe(
      `Interactive keyboard/screen-reader testing passed for WCAG 2.1.1 across 2 component(s). Automated axe-core testing found no violations across 2 component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`
    );
  });

  it('should return interactive mixed remarks with failure counts and automated suffix', () => {
    const result = buildRemarks({
      ...emptyContext(),
      criterionId: '2.1.1',
      conformance: 'partially-supports',
      interactiveAggregate: withInteractive(
        ['atomic-search-box', 'atomic-facet'],
        ['atomic-search-box']
      ),
      interactiveCoveredComponents: ['atomic-search-box', 'atomic-facet'],
      interactiveFailedComponents: ['atomic-search-box'],
      coveredComponents: ['atomic-search-box', 'atomic-facet'],
      violatingComponents: ['atomic-facet'],
    });

    expect(result).toBe(
      `Interactive keyboard/screen-reader testing found failures for WCAG 2.1.1 in 1 of 2 component(s). Automated axe-core testing found violations in 1 of 2 component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`
    );
  });

  it('should return interactive remarks without automated suffix when no automated data exists', () => {
    const result = buildRemarks({
      ...emptyContext(),
      criterionId: '1.4.3',
      conformance: 'supports',
      interactiveAggregate: withInteractive(['atomic-search-box'], []),
      interactiveCoveredComponents: ['atomic-search-box'],
      interactiveFailedComponents: [],
      coveredComponents: [],
      violatingComponents: [],
    });

    expect(result).toBe(
      `Interactive keyboard/screen-reader testing passed for WCAG 1.4.3 across 1 component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`
    );
  });

  it('should return automated supports remarks with interactive suffix appended', () => {
    const result = buildRemarks({
      ...emptyContext(),
      criterionId: '1.1.1',
      conformance: 'supports',
      coveredComponents: ['atomic-search-box', 'atomic-facet'],
      violatingComponents: [],
      interactiveCoveredComponents: ['atomic-search-box', 'atomic-facet'],
      interactiveFailedComponents: [],
    });

    expect(result).toBe(
      `Automated testing found no axe-core violations for WCAG 1.1.1 across 2 mapped component(s). Interactive keyboard/screen-reader testing passed across 2 component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`
    );
  });

  it('should return automated partially-supports remarks with interactive suffix appended', () => {
    const result = buildRemarks({
      ...emptyContext(),
      criterionId: '1.1.1',
      conformance: 'partially-supports',
      coveredComponents: ['atomic-search-box', 'atomic-facet'],
      violatingComponents: ['atomic-search-box'],
      interactiveCoveredComponents: ['atomic-search-box', 'atomic-facet'],
      interactiveFailedComponents: ['atomic-search-box'],
    });

    expect(result).toBe(
      `Automated testing found violations for WCAG 1.1.1 in 1 of 2 mapped component(s). Interactive keyboard/screen-reader testing found failures in 1 of 2 component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`
    );
  });

  it('should return automated supports remarks without interactive suffix when no interactive data exists', () => {
    const result = buildRemarks({
      ...emptyContext(),
      criterionId: '1.1.1',
      conformance: 'supports',
      coveredComponents: ['atomic-search-box'],
      violatingComponents: [],
      interactiveCoveredComponents: [],
      interactiveFailedComponents: [],
    });

    expect(result).toBe(
      `Automated testing found no axe-core violations for WCAG 1.1.1 across 1 mapped component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`
    );
  });

  it('should return not-evaluated fallback remarks when no data exists', () => {
    const result = buildRemarks(emptyContext());

    expect(result).toBe(
      `WCAG 1.1.1 has no automated mapping evidence in the JSON report. ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`
    );
  });
});
