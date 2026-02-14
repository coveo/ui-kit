import axeCore from 'axe-core';

export const ruleToWCAG: Record<string, readonly string[]> = {
  'aria-input-field-name': ['1.3.1', '4.1.2'],
  'aria-toggle-field-name': ['4.1.2'],
  bypass: ['2.4.1'],
  'button-name': ['4.1.2'],
  'color-contrast': ['1.4.3'],
  'document-title': ['2.4.2'],
  'duplicate-id': ['4.1.1'],
  'duplicate-id-aria': ['4.1.1', '4.1.2'],
  'frame-title': ['2.4.1', '4.1.2'],
  'html-has-lang': ['3.1.1'],
  'html-lang-valid': ['3.1.1'],
  'image-alt': ['1.1.1'],
  'input-image-alt': ['1.1.1'],
  label: ['1.3.1', '4.1.2'],
  'link-in-text-block': ['1.4.1'],
  'link-name': ['2.4.4', '4.1.2'],
  list: ['1.3.1'],
  listitem: ['1.3.1'],
  'meta-refresh': ['2.2.1'],
  'meta-viewport': ['1.4.4'],
  'nested-interactive': ['4.1.2'],
  'object-alt': ['1.1.1'],
  'select-name': ['1.3.1', '4.1.2'],
  'server-side-image-map': ['1.1.1', '2.1.1'],
  'svg-img-alt': ['1.1.1'],
  tabindex: ['2.4.3'],
  'target-size': ['2.5.8'],
  'touch-target-size': ['2.5.8'],
  'valid-lang': ['3.1.1'],
  'video-caption': ['1.2.2'],
};

interface AxeRuleMetadata {
  ruleId: string;
  tags: string[];
}

function extractCriteriaFromTags(tags: readonly string[]): string[] {
  const criterionTagPattern = /^wcag(\d)(\d)(\d{1,2})$/;

  return tags
    .map((tag) => tag.match(criterionTagPattern))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => `${match[1]}.${match[2]}.${match[3]}`);
}

export function buildAxeRuleCriteriaMap(): Map<string, string[]> {
  const criteriaByRuleId = new Map<string, string[]>();

  for (const rule of axeCore.getRules() as AxeRuleMetadata[]) {
    const mappedFromRuleId = ruleToWCAG[rule.ruleId] ?? [];
    const mappedFromTags = extractCriteriaFromTags(rule.tags ?? []);
    const criteria = [
      ...new Set([...mappedFromRuleId, ...mappedFromTags]),
    ].sort((a, b) => a.localeCompare(b, 'en-US', {numeric: true}));

    if (criteria.length > 0) {
      criteriaByRuleId.set(rule.ruleId, criteria);
    }
  }

  return criteriaByRuleId;
}
