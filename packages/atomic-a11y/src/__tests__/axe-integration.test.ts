import type {AxeResults, Result as AxeRuleResult} from 'axe-core';
import {describe, expect, it} from 'vitest';
import {
  extractCriteriaFromTags,
  getCriteriaForRule,
  getCriteriaForRuleId,
  getIncompleteMessage,
  isAxeResults,
} from '../reporter/axe-integration.js';

/**
 * Creates a mock axe rule for testing.
 * @param id - Rule ID
 * @param tags - Optional tags (e.g., ['wcag143', 'wcag412'])
 * @param nodes - Optional nodes with check messages
 * @returns Mock AxeRuleResult
 */
function createMockAxeRule(
  id: string,
  tags: string[] = [],
  nodes?: Partial<AxeRuleResult['nodes']>[0][]
): AxeRuleResult {
  const defaultNode: AxeRuleResult['nodes'][0] = {
    all: [],
    any: [
      {
        id: `${id}-check`,
        data: null,
        impact: 'moderate',
        message: `${id} check message`,
        relatedNodes: [],
      },
    ],
    none: [],
    html: `<div data-rule="${id}"></div>`,
    target: ['div'],
    failureSummary: `${id} failure summary`,
  };

  return {
    id,
    tags,
    impact: 'moderate',
    description: `${id} description`,
    help: `${id} help text`,
    helpUrl: `https://example.com/${id}`,
    nodes: (nodes || [defaultNode]) as AxeRuleResult['nodes'],
  };
}

describe('isAxeResults()', () => {
  it('returns true for valid AxeResults object', () => {
    const validAxeResults: AxeResults = {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
      timestamp: new Date().toISOString(),
      url: 'http://example.com',
      toolOptions: {},
      testEngine: {name: 'axe-core', version: '4.0'},
      testRunner: {name: 'vitest'},
      testEnvironment: {
        userAgent: 'test',
        windowWidth: 1024,
        windowHeight: 768,
      },
    };

    expect(isAxeResults(validAxeResults)).toBe(true);
  });

  it('returns true for minimal valid AxeResults (only required fields)', () => {
    const minimalResults = {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
    };

    expect(isAxeResults(minimalResults)).toBe(true);
  });

  it('returns false when missing violations field', () => {
    const missingViolations = {
      passes: [],
      incomplete: [],
      inapplicable: [],
    };

    expect(isAxeResults(missingViolations)).toBe(false);
  });

  it('returns false when missing passes field', () => {
    const missingPasses = {
      violations: [],
      incomplete: [],
      inapplicable: [],
    };

    expect(isAxeResults(missingPasses)).toBe(false);
  });

  it('returns false when missing incomplete field', () => {
    const missingIncomplete = {
      violations: [],
      passes: [],
      inapplicable: [],
    };

    expect(isAxeResults(missingIncomplete)).toBe(false);
  });

  it('returns false when missing inapplicable field', () => {
    const missingInapplicable = {
      violations: [],
      passes: [],
      incomplete: [],
    };

    expect(isAxeResults(missingInapplicable)).toBe(false);
  });

  it('returns false when violations is not an array', () => {
    expect(
      isAxeResults({
        violations: 'not an array',
        passes: [],
        incomplete: [],
        inapplicable: [],
      })
    ).toBe(false);
  });

  it('returns false when passes is not an array', () => {
    expect(
      isAxeResults({
        violations: [],
        passes: {},
        incomplete: [],
        inapplicable: [],
      })
    ).toBe(false);
  });

  it('returns false when incomplete is not an array', () => {
    expect(
      isAxeResults({
        violations: [],
        passes: [],
        incomplete: null,
        inapplicable: [],
      })
    ).toBe(false);
  });

  it('returns false when inapplicable is not an array', () => {
    expect(
      isAxeResults({
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: 123,
      })
    ).toBe(false);
  });

  it('returns false for non-object values', () => {
    expect(isAxeResults(null)).toBe(false);
    expect(isAxeResults(undefined)).toBe(false);
    expect(isAxeResults('string')).toBe(false);
    expect(isAxeResults(123)).toBe(false);
    expect(isAxeResults([])).toBe(false);
  });

  it('returns false for arrays even with correct shape', () => {
    const arrayLikeShape = [
      {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: [],
      },
    ];

    expect(isAxeResults(arrayLikeShape)).toBe(false);
  });
});

describe('getCriteriaForRule()', () => {
  it('returns sorted criteria for rule with wcag tags', () => {
    const rule = createMockAxeRule('color-contrast', ['wcag131', 'wcag143']);
    const criteria = getCriteriaForRule(rule);

    expect(criteria).toEqual(['1.3.1', '1.4.3']);
  });

  it('returns empty array for rule with no wcag tags', () => {
    const rule = createMockAxeRule('some-rule', ['best-practice']);
    const criteria = getCriteriaForRule(rule);

    expect(criteria).toEqual([]);
  });

  it('returns correctly sorted criteria with multiple tags', () => {
    const rule = createMockAxeRule('test-rule', [
      'wcag412',
      'wcag111',
      'wcag143',
    ]);
    const criteria = getCriteriaForRule(rule);

    expect(criteria).toEqual(['1.1.1', '1.4.3', '4.1.2']);
  });

  it('ignores non-wcag tags', () => {
    const rule = createMockAxeRule('test-rule', [
      'wcag143',
      'best-practice',
      'wcag412',
      'experimental',
    ]);
    const criteria = getCriteriaForRule(rule);

    expect(criteria).toEqual(['1.4.3', '4.1.2']);
  });

  it('handles single wcag tag', () => {
    const rule = createMockAxeRule('image-alt', ['wcag111']);
    const criteria = getCriteriaForRule(rule);

    expect(criteria).toEqual(['1.1.1']);
  });

  it('sorts criteria numerically, not lexicographically', () => {
    // Without proper sorting, ['1.10.1', '1.2.1'] would come before ['1.9.1']
    const rule = createMockAxeRule('test-rule', [
      'wcag1101',
      'wcag121',
      'wcag191',
    ]);
    const criteria = getCriteriaForRule(rule);

    expect(criteria).toEqual(['1.1.01', '1.2.1', '1.9.1']);
  });
});

describe('getCriteriaForRuleId()', () => {
  it('returns criteria for known axe rule', () => {
    // 'color-contrast' is a real axe rule that maps to wcag 1.4.3
    const criteria = getCriteriaForRuleId('color-contrast');

    expect(criteria).toContain('1.4.3');
    expect(Array.isArray(criteria)).toBe(true);
  });

  it('returns empty array for unknown rule ID', () => {
    const criteria = getCriteriaForRuleId('nonexistent-rule-xyz');

    expect(criteria).toEqual([]);
  });

  it('returns sorted criteria for multi-criterion rules', () => {
    // Find a rule that maps to multiple criteria
    // 'button-name' typically maps to multiple criteria
    const criteria = getCriteriaForRuleId('button-name');

    if (criteria.length > 1) {
      // Verify they are sorted
      const sorted = [...criteria].sort((a, b) =>
        a.localeCompare(b, 'en-US', {numeric: true})
      );
      expect(criteria).toEqual(sorted);
    }
  });

  it('returns consistent results for same rule ID', () => {
    const call1 = getCriteriaForRuleId('link-name');
    const call2 = getCriteriaForRuleId('link-name');

    expect(call1).toEqual(call2);
  });
});

describe('getIncompleteMessage()', () => {
  it('returns message from first any check when available', () => {
    const rule = createMockAxeRule(
      'test-rule',
      [],
      [
        {
          any: [
            {
              id: 'check-1',
              data: null,
              impact: 'moderate',
              message: 'First any check message',
              relatedNodes: [],
            },
          ],
          all: [],
          none: [],
          html: '<div></div>',
          target: ['div'],
          failureSummary: 'failure',
        },
      ]
    );

    const message = getIncompleteMessage(rule);
    expect(message).toBe('First any check message');
  });

  it('returns message from first all check when no any checks', () => {
    const rule = createMockAxeRule(
      'test-rule',
      [],
      [
        {
          any: [],
          all: [
            {
              id: 'check-2',
              data: null,
              impact: 'moderate',
              message: 'First all check message',
              relatedNodes: [],
            },
          ],
          none: [],
          html: '<div></div>',
          target: ['div'],
          failureSummary: 'failure',
        },
      ]
    );

    const message = getIncompleteMessage(rule);
    expect(message).toBe('First all check message');
  });

  it('returns message from first none check when no any or all checks', () => {
    const rule = createMockAxeRule(
      'test-rule',
      [],
      [
        {
          any: [],
          all: [],
          none: [
            {
              id: 'check-3',
              data: null,
              impact: 'moderate',
              message: 'First none check message',
              relatedNodes: [],
            },
          ],
          html: '<div></div>',
          target: ['div'],
          failureSummary: 'failure',
        },
      ]
    );

    const message = getIncompleteMessage(rule);
    expect(message).toBe('First none check message');
  });

  it('falls back to rule.help when no check messages found', () => {
    const rule = createMockAxeRule(
      'test-rule',
      [],
      [
        {
          any: [],
          all: [],
          none: [],
          html: '<div></div>',
          target: ['div'],
          failureSummary: 'failure',
        },
      ]
    );

    const message = getIncompleteMessage(rule);
    expect(message).toBe('test-rule help text');
  });

  it('uses first node when rule has multiple nodes', () => {
    const rule: AxeRuleResult = {
      id: 'test-rule',
      tags: [],
      impact: 'moderate',
      description: 'description',
      help: 'fallback help',
      helpUrl: 'https://example.com',
      nodes: [
        {
          any: [
            {
              id: 'check-1',
              data: null,
              impact: 'moderate',
              message: 'First node message',
              relatedNodes: [],
            },
          ],
          all: [],
          none: [],
          html: '<div id="first"></div>',
          target: ['#first'],
          failureSummary: 'first failure',
        },
        {
          any: [
            {
              id: 'check-2',
              data: null,
              impact: 'moderate',
              message: 'Second node message',
              relatedNodes: [],
            },
          ],
          all: [],
          none: [],
          html: '<div id="second"></div>',
          target: ['#second'],
          failureSummary: 'second failure',
        },
      ],
    };

    const message = getIncompleteMessage(rule);
    expect(message).toBe('First node message');
  });

  it('handles rule with empty nodes array', () => {
    const rule: AxeRuleResult = {
      id: 'test-rule',
      tags: [],
      impact: 'moderate',
      description: 'description',
      help: 'fallback help text',
      helpUrl: 'https://example.com',
      nodes: [],
    };

    const message = getIncompleteMessage(rule);
    expect(message).toBe('fallback help text');
  });

  it('prefers any check over all check', () => {
    const rule = createMockAxeRule(
      'test-rule',
      [],
      [
        {
          any: [
            {
              id: 'any-check',
              data: null,
              impact: 'moderate',
              message: 'Any check message',
              relatedNodes: [],
            },
          ],
          all: [
            {
              id: 'all-check',
              data: null,
              impact: 'moderate',
              message: 'All check message',
              relatedNodes: [],
            },
          ],
          none: [],
          html: '<div></div>',
          target: ['div'],
          failureSummary: 'failure',
        },
      ]
    );

    const message = getIncompleteMessage(rule);
    expect(message).toBe('Any check message');
  });

  it('prefers all check over none check', () => {
    const rule = createMockAxeRule(
      'test-rule',
      [],
      [
        {
          any: [],
          all: [
            {
              id: 'all-check',
              data: null,
              impact: 'moderate',
              message: 'All check message',
              relatedNodes: [],
            },
          ],
          none: [
            {
              id: 'none-check',
              data: null,
              impact: 'moderate',
              message: 'None check message',
              relatedNodes: [],
            },
          ],
          html: '<div></div>',
          target: ['div'],
          failureSummary: 'failure',
        },
      ]
    );

    const message = getIncompleteMessage(rule);
    expect(message).toBe('All check message');
  });
});

describe('extractCriteriaFromTags() re-export', () => {
  it('parses wcag tags into dotted notation', () => {
    const criteria = extractCriteriaFromTags(['wcag143', 'wcag412']);

    expect(criteria).toEqual(['1.4.3', '4.1.2']);
  });

  it('filters out non-wcag tags', () => {
    const criteria = extractCriteriaFromTags([
      'wcag143',
      'best-practice',
      'wcag111',
    ]);

    expect(criteria).toEqual(['1.4.3', '1.1.1']);
  });

  it('handles empty tag array', () => {
    const criteria = extractCriteriaFromTags([]);

    expect(criteria).toEqual([]);
  });

  it('handles wcag tags with two-digit criterion numbers', () => {
    const criteria = extractCriteriaFromTags(['wcag1101', 'wcag1211']);

    expect(criteria).toEqual(['1.1.01', '1.2.11']);
  });
});
