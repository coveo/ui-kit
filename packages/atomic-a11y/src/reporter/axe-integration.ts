import type {AxeResults, Result as AxeRuleResult} from 'axe-core';
import {isRecord} from '../shared/guards.js';
import {compareByNumericId} from '../shared/sorting.js';

const CRITERION_TAG_PATTERN = /^wcag(\d)(\d)(\d{1,2})$/;
const criteriaByTags = new Map<string, string[]>();

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
  const tags = rule.tags as string[];
  const cacheKey = tags.join('\0');
  const cachedCriteria = criteriaByTags.get(cacheKey);
  if (cachedCriteria) {
    return [...cachedCriteria];
  }

  const criteria: string[] = [];
  for (const tag of tags) {
    const match = tag.match(CRITERION_TAG_PATTERN);
    if (match) {
      criteria.push(`${match[1]}.${match[2]}.${match[3]}`);
    }
  }

  criteria.sort(compareByNumericId);
  criteriaByTags.set(cacheKey, criteria);
  return [...criteria];
}

export function getIncompleteMessage(rule: AxeRuleResult): string {
  const firstNode = rule.nodes[0];
  const firstCheckMessage =
    firstNode?.any[0]?.message ??
    firstNode?.all[0]?.message ??
    firstNode?.none[0]?.message;

  return firstCheckMessage ?? rule.help;
}
