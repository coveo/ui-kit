import {DEFAULT_MANUAL_PLACEHOLDER_NOTE} from '../shared/constants.js';
import type {A11yCriterionReport} from '../shared/types.js';
import {
  countManualConformances,
  resolveManualConformance,
} from './manual-audit.js';
import type {
  A11yOverrideEntry,
  CriterionAggregate,
  ManualAuditAggregate,
  OpenAcrConformance,
} from './types.js';
import {reportConformanceToOpenAcr} from './types.js';

export interface ConformanceContext {
  criterion: A11yCriterionReport | undefined;
  aggregate: CriterionAggregate | undefined;
  manualAggregates: ManualAuditAggregate[] | undefined;
  override: A11yOverrideEntry | undefined;
}

export interface RemarksContext extends ConformanceContext {
  criterionId: string;
  conformance: OpenAcrConformance;
  coveredComponents: string[];
  violatingComponents: string[];
}

function mapCriterionConformance(
  criterion: A11yCriterionReport | undefined
): OpenAcrConformance | null {
  if (!criterion) {
    return null;
  }

  return reportConformanceToOpenAcr[criterion.conformance] ?? null;
}

function resolveAutomatedConformance(
  aggregate: CriterionAggregate | undefined
): OpenAcrConformance {
  const coveredCount = aggregate?.coveredComponents.size ?? 0;
  if (coveredCount === 0) {
    return 'not-evaluated';
  }

  const violatingCount = aggregate?.violatingComponents.size ?? 0;
  if (violatingCount === 0) {
    return 'supports';
  }

  if (violatingCount >= coveredCount) {
    return 'does-not-support';
  }

  return 'partially-supports';
}

export function resolveConformance(
  context: ConformanceContext
): OpenAcrConformance {
  const {override, manualAggregates, criterion, aggregate} = context;

  if (override) {
    return override.conformance;
  }

  const manualConformance = resolveManualConformance(manualAggregates);
  if (manualConformance) {
    return manualConformance;
  }

  const existingConformance = mapCriterionConformance(criterion);

  if (existingConformance && existingConformance !== 'not-evaluated') {
    return existingConformance;
  }

  return resolveAutomatedConformance(aggregate);
}

export function buildRemarks(context: RemarksContext): string {
  const {
    criterionId,
    conformance,
    coveredComponents,
    violatingComponents,
    manualAggregates,
    override,
  } = context;

  if (override) {
    return `[Override] ${override.reason}`;
  }

  if (manualAggregates && manualAggregates.length > 0) {
    const {pass, fail, partial, notApplicable} =
      countManualConformances(manualAggregates);

    const summaryParts: string[] = [];
    if (pass > 0) summaryParts.push(`${pass} pass`);
    if (fail > 0) summaryParts.push(`${fail} fail`);
    if (partial > 0) summaryParts.push(`${partial} partial`);
    if (notApplicable > 0) summaryParts.push(`${notApplicable} not-applicable`);

    const summary = summaryParts.join(', ');
    return `Manual audit: ${summary} across ${manualAggregates.length} component(s).`;
  }

  const coveredCount = coveredComponents.length;
  const violatingCount = violatingComponents.length;

  if (conformance === 'supports') {
    return `Automated testing found no axe-core violations for WCAG ${criterionId} across ${coveredCount} mapped component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
  }

  if (conformance === 'partially-supports') {
    return `Automated testing found violations for WCAG ${criterionId} in ${violatingCount} of ${coveredCount} mapped component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
  }

  if (conformance === 'does-not-support') {
    return `Automated testing found violations for WCAG ${criterionId} in all ${coveredCount} mapped component(s). ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
  }

  if (conformance === 'not-applicable') {
    return `WCAG ${criterionId} is not applicable for the tested component scope.`;
  }

  return `WCAG ${criterionId} has no automated mapping evidence in the JSON report. ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
}
