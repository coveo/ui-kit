import type {AxeResults, Result as AxeRuleResult} from 'axe-core';
import {isRecord} from '../shared/guards.js';
import {compareByNumericId} from '../shared/sorting.js';

export function isAxeResults(value: unknown): value is AxeResults {
  return (
    isRecord(value) &&
    Array.isArray(value.violations) &&
    Array.isArray(value.passes) &&
    Array.isArray(value.incomplete) &&
    Array.isArray(value.inapplicable)
  );
}

export function getCriteriaForRule(rule: AxeRuleResult): string[] {
  const criterionTagPattern = /^wcag(\d)(\d)(\d{1,2})$/;

  return (rule.tags as string[])
    .map((tag) => tag.match(criterionTagPattern))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => `${match[1]}.${match[2]}.${match[3]}`)
    .sort(compareByNumericId);
}

export function getIncompleteMessage(rule: AxeRuleResult): string {
  const firstNode = rule.nodes[0];
  const firstCheckMessage =
    firstNode?.any[0]?.message ??
    firstNode?.all[0]?.message ??
    firstNode?.none[0]?.message;

  return firstCheckMessage ?? rule.help;
}
