import type {AxeResults, Result as AxeRuleResult} from 'axe-core';
import {
  buildAxeRuleCriteriaMap,
  ruleToWCAG,
} from '../data/axe-rule-mappings.js';
import {isRecord} from '../shared/guards.js';

const axeRuleCriteriaMap = buildAxeRuleCriteriaMap();

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

export function extractCriteriaFromTags(tags: readonly string[]): string[] {
  const criterionTagPattern = /^wcag(\d)(\d)(\d{1,2})$/;

  return tags
    .map((tag) => tag.match(criterionTagPattern))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => `${match[1]}.${match[2]}.${match[3]}`);
}

export function getCriteriaForRule(rule: AxeRuleResult): string[] {
  const mappedFromRuleId = ruleToWCAG[rule.id] ?? [];
  const mappedFromTags = extractCriteriaFromTags(rule.tags);

  return [...new Set([...mappedFromRuleId, ...mappedFromTags])].sort((a, b) =>
    a.localeCompare(b, 'en-US', {numeric: true})
  );
}

export function getCriteriaForRuleId(ruleId: string): string[] {
  const mappedFromRuleId = ruleToWCAG[ruleId] ?? [];
  const mappedFromAxeMetadata = axeRuleCriteriaMap.get(ruleId) ?? [];

  return [...new Set([...mappedFromRuleId, ...mappedFromAxeMetadata])].sort(
    (a, b) => a.localeCompare(b, 'en-US', {numeric: true})
  );
}

export function getIncompleteMessage(rule: AxeRuleResult): string {
  const firstNode = rule.nodes[0];
  const firstCheckMessage =
    firstNode?.any[0]?.message ??
    firstNode?.all[0]?.message ??
    firstNode?.none[0]?.message;

  return firstCheckMessage ?? rule.help;
}
