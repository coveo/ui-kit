import type {AxeResults, Result as AxeRuleResult} from 'axe-core';
import {extractCriteriaFromTags} from '../data/axe-rule-mappings.js';
import {isRecord} from '../shared/guards.js';
import {compareByNumericId} from '../shared/sorting.js';

export function isAxeResults(value: unknown): value is AxeResults {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.violations) &&
    Array.isArray(value.passes) &&
    Array.isArray(value.incomplete) &&
    Array.isArray(value.inapplicable)
  );
}

export function getCriteriaForRule(rule: AxeRuleResult): string[] {
  return extractCriteriaFromTags(rule.tags).sort(compareByNumericId);
}

export function getIncompleteMessage(rule: AxeRuleResult): string {
  const firstNode = rule.nodes[0];
  const firstCheckMessage =
    firstNode?.any[0]?.message ??
    firstNode?.all[0]?.message ??
    firstNode?.none[0]?.message;

  return firstCheckMessage ?? rule.help;
}
