import {describe, expect, it} from 'vitest';
import {buildInsightLayout} from './insight-layout';

describe('buildInsightLayout', () => {
  const toggleSelectors = [
    'atomic-insight-refine-toggle',
    'atomic-insight-edit-toggle',
    'atomic-insight-history-toggle',
  ];

  const buildCss = () => {
    const element = document.createElement('atomic-insight-layout');
    element.id = 'layout';
    return buildInsightLayout(element, '1024px');
  };

  const parseRules = (css: string) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    return Array.from(sheet.cssRules).filter(
      (rule): rule is CSSStyleRule => rule instanceof CSSStyleRule
    );
  };

  it('should not leave a comma between the generated rules', () => {
    expect(buildCss()).not.toMatch(/}\s*,/);
  });

  it.each(toggleSelectors)('should generate a flex-shrink: 0 rule for %s', (toggleSelector) => {
    const rule = parseRules(buildCss()).find((r) => r.selectorText.endsWith(` ${toggleSelector}`));

    expect(rule).toBeDefined();
    expect(rule?.style.getPropertyValue('flex-shrink')).toBe('0');
  });
});
