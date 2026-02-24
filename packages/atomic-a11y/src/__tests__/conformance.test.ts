import {describe, expect, it} from 'vitest';
import {
  buildRemarks,
  mapCriterionConformance,
  resolveConformance,
} from '../openacr/conformance.js';
import type {
  A11yOverrideEntry,
  CriterionAggregate,
  ManualAuditAggregate,
} from '../openacr/types.js';
import type {A11yCriterionReport} from '../shared/types.js';

function createMockCriterionReport(
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
    affectedComponents: [],
    ...overrides,
  };
}

function createMockAggregate(
  overrides: Partial<{
    covered: string[];
    violating: string[];
  }> = {}
): CriterionAggregate {
  return {
    coveredComponents: new Set(overrides.covered ?? []),
    violatingComponents: new Set(overrides.violating ?? []),
  };
}

function createMockOverride(
  overrides: Partial<A11yOverrideEntry> = {}
): A11yOverrideEntry {
  return {
    criterion: '1.1.1',
    conformance: 'not-applicable',
    reason: 'Overridden by policy',
    ...overrides,
  };
}

function createMockManualAggregate(
  overrides: Partial<ManualAuditAggregate> = {}
): ManualAuditAggregate {
  return {
    componentName: 'atomic-search-box',
    criterionId: '1.1.1',
    conformance: 'supports',
    ...overrides,
  };
}

describe('mapCriterionConformance()', () => {
  it('should return null when criterion is undefined', () => {
    expect(mapCriterionConformance(undefined)).toBeNull();
  });

  it('should map "supports" conformance to "supports"', () => {
    const criterion = createMockCriterionReport({conformance: 'supports'});
    expect(mapCriterionConformance(criterion)).toBe('supports');
  });

  it('should map "partiallySupports" to "partially-supports"', () => {
    const criterion = createMockCriterionReport({
      conformance: 'partiallySupports',
    });
    expect(mapCriterionConformance(criterion)).toBe('partially-supports');
  });

  it('should map "doesNotSupport" to "does-not-support"', () => {
    const criterion = createMockCriterionReport({
      conformance: 'doesNotSupport',
    });
    expect(mapCriterionConformance(criterion)).toBe('does-not-support');
  });

  it('should map "notApplicable" to "not-applicable"', () => {
    const criterion = createMockCriterionReport({
      conformance: 'notApplicable',
    });
    expect(mapCriterionConformance(criterion)).toBe('not-applicable');
  });

  it('should map "notEvaluated" to "not-evaluated"', () => {
    const criterion = createMockCriterionReport({
      conformance: 'notEvaluated',
    });
    expect(mapCriterionConformance(criterion)).toBe('not-evaluated');
  });
});

describe('resolveConformance()', () => {
  it('should return override conformance when override is provided', () => {
    const result = resolveConformance(
      undefined,
      createMockAggregate({
        covered: ['atomic-search-box'],
        violating: ['atomic-search-box'],
      }),
      [createMockManualAggregate({conformance: 'supports'})],
      createMockOverride({conformance: 'not-applicable'})
    );

    expect(result).toBe('not-applicable');
  });

  it('should return manual conformance when no override and manual aggregates exist', () => {
    const result = resolveConformance(
      undefined,
      createMockAggregate({
        covered: ['atomic-search-box'],
        violating: ['atomic-search-box'],
      }),
      [createMockManualAggregate({conformance: 'supports'})],
      undefined
    );

    expect(result).toBe('supports');
  });

  it('should return existing criterion conformance when no override or manual data', () => {
    const criterion = createMockCriterionReport({conformance: 'supports'});
    const result = resolveConformance(
      criterion,
      undefined,
      undefined,
      undefined
    );

    expect(result).toBe('supports');
  });

  it('should fall through to automated conformance when criterion is notEvaluated', () => {
    const criterion = createMockCriterionReport({
      conformance: 'notEvaluated',
    });
    const aggregate = createMockAggregate({
      covered: ['atomic-search-box'],
      violating: [],
    });

    const result = resolveConformance(
      criterion,
      aggregate,
      undefined,
      undefined
    );

    expect(result).toBe('supports');
  });

  it('should return "does-not-support" from automated when all covered components have violations', () => {
    const result = resolveConformance(
      undefined,
      createMockAggregate({
        covered: ['atomic-search-box'],
        violating: ['atomic-search-box'],
      }),
      undefined,
      undefined
    );

    expect(result).toBe('does-not-support');
  });

  it('should return "partially-supports" from automated when some but not all components have violations', () => {
    const result = resolveConformance(
      undefined,
      createMockAggregate({
        covered: ['atomic-search-box', 'atomic-facet'],
        violating: ['atomic-search-box'],
      }),
      undefined,
      undefined
    );

    expect(result).toBe('partially-supports');
  });

  it('should return "supports" from automated when no components have violations', () => {
    const result = resolveConformance(
      undefined,
      createMockAggregate({
        covered: ['atomic-search-box'],
        violating: [],
      }),
      undefined,
      undefined
    );

    expect(result).toBe('supports');
  });

  it('should return "not-evaluated" from automated when no components are covered', () => {
    const result = resolveConformance(
      undefined,
      createMockAggregate({covered: [], violating: []}),
      undefined,
      undefined
    );

    expect(result).toBe('not-evaluated');
  });

  it('should return "not-evaluated" when aggregate is undefined', () => {
    const result = resolveConformance(
      undefined,
      undefined,
      undefined,
      undefined
    );

    expect(result).toBe('not-evaluated');
  });
});

describe('buildRemarks()', () => {
  it('should return override reason when override is provided', () => {
    const remarks = buildRemarks(
      '1.1.1',
      'not-applicable',
      [],
      [],
      undefined,
      createMockOverride({reason: 'Not relevant for this product'})
    );

    expect(remarks).toBe('[Override] Not relevant for this product');
  });

  it('should generate manual audit summary when manual aggregates exist', () => {
    const manualAggregates: ManualAuditAggregate[] = [
      createMockManualAggregate({
        componentName: 'atomic-search-box',
        conformance: 'supports',
      }),
      createMockManualAggregate({
        componentName: 'atomic-result-list',
        conformance: 'does-not-support',
      }),
    ];

    const remarks = buildRemarks(
      '1.1.1',
      'partially-supports',
      ['atomic-search-box', 'atomic-result-list'],
      ['atomic-result-list'],
      manualAggregates,
      undefined
    );

    expect(remarks).toContain('Manual audit:');
    expect(remarks).toContain('1 pass');
    expect(remarks).toContain('1 fail');
    expect(remarks).toContain('across 2 component(s).');
  });

  it('should include partial and not-applicable counts in manual summary', () => {
    const manualAggregates: ManualAuditAggregate[] = [
      createMockManualAggregate({conformance: 'partially-supports'}),
      createMockManualAggregate({conformance: 'not-applicable'}),
    ];

    const remarks = buildRemarks(
      '1.1.1',
      'partially-supports',
      [],
      [],
      manualAggregates,
      undefined
    );

    expect(remarks).toContain('1 partial');
    expect(remarks).toContain('1 not-applicable');
  });

  it('should generate "supports" remark for automated pass with no violations', () => {
    const remarks = buildRemarks(
      '1.4.3',
      'supports',
      ['atomic-search-box', 'atomic-facet'],
      [],
      undefined,
      undefined
    );

    expect(remarks).toContain(
      'no axe-core violations for WCAG 1.4.3 across 2 mapped component(s)'
    );
    expect(remarks).toContain('Manual audit pending');
  });

  it('should generate "partially-supports" remark for partial violations', () => {
    const remarks = buildRemarks(
      '1.4.3',
      'partially-supports',
      ['atomic-search-box', 'atomic-facet'],
      ['atomic-facet'],
      undefined,
      undefined
    );

    expect(remarks).toContain(
      'violations for WCAG 1.4.3 in 1 of 2 mapped component(s)'
    );
  });

  it('should generate "does-not-support" remark when all components have violations', () => {
    const remarks = buildRemarks(
      '1.4.3',
      'does-not-support',
      ['atomic-search-box'],
      ['atomic-search-box'],
      undefined,
      undefined
    );

    expect(remarks).toContain(
      'violations for WCAG 1.4.3 in all 1 mapped component(s)'
    );
  });

  it('should generate "not-applicable" remark', () => {
    const remarks = buildRemarks(
      '2.4.1',
      'not-applicable',
      [],
      [],
      undefined,
      undefined
    );

    expect(remarks).toContain(
      'WCAG 2.4.1 is not applicable for the tested component scope'
    );
  });

  it('should generate fallback remark for "not-evaluated" conformance', () => {
    const remarks = buildRemarks(
      '3.1.1',
      'not-evaluated',
      [],
      [],
      undefined,
      undefined
    );

    expect(remarks).toContain(
      'WCAG 3.1.1 has no automated mapping evidence in the JSON report'
    );
    expect(remarks).toContain('Manual audit pending');
  });
});
