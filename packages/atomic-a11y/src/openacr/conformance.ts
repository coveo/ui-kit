import {DEFAULT_MANUAL_PLACEHOLDER_NOTE} from '../shared/constants.js';
import type {A11yCriterionReport} from '../shared/types.js';
import {
  countManualConformances,
  resolveManualConformance,
} from './manual-audit.js';
import type {
  A11yOverrideEntry,
  CriterionAggregate,
  InteractiveAggregate,
  ManualAuditAggregate,
  OpenAcrConformance,
} from './types.js';
import {reportConformanceToOpenAcr} from './types.js';

interface ConformanceContext {
  criterion: A11yCriterionReport | undefined;
  aggregate: CriterionAggregate | undefined;
  interactiveAggregate: InteractiveAggregate | undefined;
  manualAggregates: ManualAuditAggregate[] | undefined;
  override: A11yOverrideEntry | undefined;
}

interface RemarksContext extends ConformanceContext {
  criterionId: string;
  conformance: OpenAcrConformance;
  coveredComponents: string[];
  violatingComponents: string[];
  interactiveCoveredComponents: string[];
  interactiveFailedComponents: string[];
}

function mapCriterionConformance(
  criterion: A11yCriterionReport | undefined
): OpenAcrConformance | null {
  if (!criterion) {
    return null;
  }

  return reportConformanceToOpenAcr[criterion.conformance] ?? null;
}

function resolveInteractiveConformance(
  interactiveAggregate: InteractiveAggregate | undefined
): OpenAcrConformance | null {
  const coveredCount = interactiveAggregate?.coveredComponents.size ?? 0;
  if (coveredCount === 0) {
    return null;
  }

  const failedCount = interactiveAggregate?.failedComponents.size ?? 0;
  if (failedCount === 0) {
    return 'supports';
  }

  if (failedCount >= coveredCount) {
    return 'does-not-support';
  }

  return 'partially-supports';
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
  const {
    override,
    manualAggregates,
    interactiveAggregate,
    criterion,
    aggregate,
  } = context;

  if (override) {
    return override.conformance;
  }

  const manualConformance = resolveManualConformance(manualAggregates);
  if (manualConformance) {
    return manualConformance;
  }

  const interactiveConformance =
    resolveInteractiveConformance(interactiveAggregate);
  if (interactiveConformance) {
    return interactiveConformance;
  }

  const existingConformance = mapCriterionConformance(criterion);

  if (existingConformance && existingConformance !== 'not-evaluated') {
    return existingConformance;
  }

  return resolveAutomatedConformance(aggregate);
}

function buildInteractiveSuffix(
  interactiveCoveredComponents: string[],
  interactiveFailedComponents: string[]
): string {
  const coveredCount = interactiveCoveredComponents.length;
  if (coveredCount === 0) {
    return '';
  }

  const failedCount = interactiveFailedComponents.length;
  if (failedCount === 0) {
    return ` Interactive keyboard/screen-reader testing passed across ${coveredCount} component(s).`;
  }

  return ` Interactive keyboard/screen-reader testing found failures in ${failedCount} of ${coveredCount} component(s).`;
}

function buildAutomatedSuffix(
  coveredComponents: string[],
  violatingComponents: string[]
): string {
  const coveredCount = coveredComponents.length;
  if (coveredCount === 0) {
    return '';
  }

  const violatingCount = violatingComponents.length;
  if (violatingCount === 0) {
    return ` Automated axe-core testing found no violations across ${coveredCount} component(s).`;
  }

  return ` Automated axe-core testing found violations in ${violatingCount} of ${coveredCount} component(s).`;
}

export function buildRemarks(context: RemarksContext): string {
  const {
    criterionId,
    conformance,
    coveredComponents,
    violatingComponents,
    interactiveCoveredComponents,
    interactiveFailedComponents,
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

  const interactiveDrives =
    resolveInteractiveConformance(context.interactiveAggregate) !== null;

  if (interactiveDrives) {
    const coveredCount = interactiveCoveredComponents.length;
    const failedCount = interactiveFailedComponents.length;

    let primary: string;
    if (failedCount === 0) {
      primary = `Interactive keyboard/screen-reader testing passed for WCAG ${criterionId} across ${coveredCount} component(s).`;
    } else if (failedCount >= coveredCount) {
      primary = `Interactive keyboard/screen-reader testing found failures for WCAG ${criterionId} in all ${coveredCount} component(s).`;
    } else {
      primary = `Interactive keyboard/screen-reader testing found failures for WCAG ${criterionId} in ${failedCount} of ${coveredCount} component(s).`;
    }

    const automatedSuffix = buildAutomatedSuffix(
      coveredComponents,
      violatingComponents
    );
    return `${primary}${automatedSuffix} ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
  }

  const automatedCoveredCount = coveredComponents.length;
  const automatedViolatingCount = violatingComponents.length;
  const interactiveSuffix = buildInteractiveSuffix(
    interactiveCoveredComponents,
    interactiveFailedComponents
  );

  if (conformance === 'supports') {
    return `Automated testing found no axe-core violations for WCAG ${criterionId} across ${automatedCoveredCount} mapped component(s).${interactiveSuffix} ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
  }

  if (conformance === 'partially-supports') {
    return `Automated testing found violations for WCAG ${criterionId} in ${automatedViolatingCount} of ${automatedCoveredCount} mapped component(s).${interactiveSuffix} ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
  }

  if (conformance === 'does-not-support') {
    return `Automated testing found violations for WCAG ${criterionId} in all ${automatedCoveredCount} mapped component(s).${interactiveSuffix} ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
  }

  if (conformance === 'not-applicable') {
    return `WCAG ${criterionId} is not applicable for the tested component scope.`;
  }

  return `WCAG ${criterionId} has no automated mapping evidence in the JSON report. ${DEFAULT_MANUAL_PLACEHOLDER_NOTE}`;
}
