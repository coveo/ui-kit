import {resolveManualConformance} from './manual-audit.js';
import type {
  A11yOverrideEntry,
  CriterionAggregate,
  InteractiveAggregate,
  ManualAuditAggregate,
  OpenAcrConformance,
} from './types.js';
import {CONFORMANCE_SEVERITY} from './types.js';

const openAcrConformanceLabel: Record<OpenAcrConformance, string> = {
  supports: 'Supports',
  'partially-supports': 'Partially Supports',
  'does-not-support': 'Does Not Support',
  'not-applicable': 'Not Applicable',
};

interface ConformanceContext {
  aggregate?: CriterionAggregate;
  interactiveAggregate?: InteractiveAggregate;
  manualAggregates?: ManualAuditAggregate[];
  override?: A11yOverrideEntry;
}

interface RemarksContext extends ConformanceContext {
  criterionId: string;
  conformance: OpenAcrConformance;
}

function worst(a: OpenAcrConformance, b: OpenAcrConformance): OpenAcrConformance {
  return CONFORMANCE_SEVERITY[a] >= CONFORMANCE_SEVERITY[b] ? a : b;
}

/**
 * Automated (axe-core) signal for a criterion, or `null` when axe does not
 * cover it. "Uncovered" is deliberately *no signal* (not Does Not Support) so
 * manual audits can fill the gaps axe cannot test.
 */
function automatedSignal(aggregate?: CriterionAggregate): OpenAcrConformance | null {
  const covered = aggregate?.coveredComponents.size ?? 0;
  if (covered === 0) {
    return null;
  }

  const violating = aggregate?.violatingComponents.size ?? 0;
  if (violating === 0) {
    return 'supports';
  }
  if (violating >= covered) {
    return 'does-not-support';
  }
  return 'partially-supports';
}

function interactiveSignal(aggregate?: InteractiveAggregate): OpenAcrConformance | null {
  return (aggregate?.coveredComponents.size ?? 0) > 0 ? 'supports' : null;
}

/**
 * Resolves a criterion's conformance.
 *
 * An engineering override is authoritative. Otherwise the verdict is the
 * worst of the *real* signals present — automated (only when axe covers the
 * criterion), interactive, and manual. When no layer has evidence, the
 * criterion is Does Not Support, pending a manual audit.
 */
export function resolveConformance(context: ConformanceContext): OpenAcrConformance {
  const {override, aggregate, interactiveAggregate, manualAggregates} = context;

  if (override) {
    return override.conformance;
  }

  const signals = [
    automatedSignal(aggregate),
    interactiveSignal(interactiveAggregate),
    resolveManualConformance(manualAggregates) ?? null,
  ].filter((signal): signal is OpenAcrConformance => signal !== null);

  if (signals.length === 0) {
    return 'does-not-support';
  }

  return signals.reduce(worst);
}

/**
 * Human-readable explanation of how the verdict was reached: the resolved
 * conformance followed by the evidence from each contributing layer. The
 * surface label is intentionally omitted — the VPAT is product-level.
 */
export function buildRemarks(context: RemarksContext): string {
  const {override, aggregate, interactiveAggregate, manualAggregates} = context;

  if (override) {
    return override.reason;
  }

  const covered = aggregate?.coveredComponents.size ?? 0;
  const violating = aggregate?.violatingComponents.size ?? 0;
  const interactiveCovered = interactiveAggregate?.coveredComponents.size ?? 0;
  const manualConformance = resolveManualConformance(manualAggregates);
  const manualRemarks = (manualAggregates ?? [])
    .map((aggregateEntry) => aggregateEntry.remarks)
    .filter((remark): remark is string => Boolean(remark));

  const evidence: string[] = [];

  if (manualConformance) {
    const base = `manual audit found ${openAcrConformanceLabel[manualConformance]}`;
    evidence.push(manualRemarks.length > 0 ? `${base} (${manualRemarks.join('; ')})` : base);
  }

  if (covered > 0) {
    evidence.push(
      violating === 0
        ? `automated axe-core found no violations across applicable component(s) (${covered})`
        : `automated axe-core found violations in ${violating} of ${covered} component(s)`
    );
  }

  if (interactiveCovered > 0) {
    evidence.push(`interactive keyboard testing passed across ${interactiveCovered} component(s)`);
  }

  if (evidence.length === 0) {
    return `WCAG ${context.criterionId}: no automated, interactive, or manual coverage.`;
  }

  return `${openAcrConformanceLabel[context.conformance]} — ${evidence.join('; ')}.`;
}
