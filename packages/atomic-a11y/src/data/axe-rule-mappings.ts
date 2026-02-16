import axeCore from 'axe-core';

export function extractCriteriaFromTags(tags: readonly string[]): string[] {
  const criterionTagPattern = /^wcag(\d)(\d)(\d{1,2})$/;

  return tags
    .map((tag) => tag.match(criterionTagPattern))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => `${match[1]}.${match[2]}.${match[3]}`);
}

export function buildAxeRuleCriteriaMap(): Map<string, string[]> {
  const criteriaByRuleId = new Map<string, string[]>();

  for (const rule of axeCore.getRules()) {
    const criteria = extractCriteriaFromTags(rule.tags).sort((a, b) =>
      a.localeCompare(b, 'en-US', {numeric: true})
    );

    if (criteria.length > 0) {
      criteriaByRuleId.set(rule.ruleId, criteria);
    }
  }

  return criteriaByRuleId;
}
