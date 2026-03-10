import {describe, expect, it} from 'vitest';
import type {MergedResults, StoryResult} from '../audit/llm-client.js';
import {findEvidence, mergeStoryResults} from '../audit/llm-client.js';
import {ALL_AI_CRITERIA} from '../shared/constants.js';

function makeMergedResults(
  overrides: Record<string, string> = {},
  evidenceParts: string[] = []
): MergedResults {
  const wcag22Criteria: Record<string, string> = {};
  for (const key of ALL_AI_CRITERIA) {
    wcag22Criteria[key] = overrides[key] ?? 'not-applicable';
  }
  return {wcag22Criteria, evidenceParts};
}

function makeStoryResult(
  storyName: string,
  overrides: Record<string, string> = {},
  evidenceParts: string[] = []
): StoryResult {
  return {
    storyName,
    mergedResults: makeMergedResults(overrides, evidenceParts),
  };
}

describe('mergeStoryResults', () => {
  it('should return all not-applicable when given empty array', () => {
    const result = mergeStoryResults([]);

    for (const key of ALL_AI_CRITERIA) {
      expect(result.wcag22Criteria[key]).toBe('not-applicable');
    }
    expect(result.evidenceParts).toEqual([]);
  });

  it('should return the single result unchanged when given one story', () => {
    const story = makeStoryResult(
      'Default',
      {'1.3.2-meaningful-sequence': 'pass', '2.5.8-target-size': 'fail'},
      ['2.5.8-target-size: Button too small']
    );

    const result = mergeStoryResults([story]);

    expect(result).toBe(story.mergedResults);
  });

  it('should use worst-case-wins: fail beats pass', () => {
    const storyA = makeStoryResult('Default', {
      '1.3.2-meaningful-sequence': 'pass',
    });
    const storyB = makeStoryResult('WithError', {
      '1.3.2-meaningful-sequence': 'fail',
    });

    const result = mergeStoryResults([storyA, storyB]);

    expect(result.wcag22Criteria['1.3.2-meaningful-sequence']).toBe('fail');
  });

  it('should use worst-case-wins: fail beats partial', () => {
    const storyA = makeStoryResult('Default', {
      '2.4.7-focus-visible': 'partial',
    });
    const storyB = makeStoryResult('Rich', {
      '2.4.7-focus-visible': 'fail',
    });

    const result = mergeStoryResults([storyA, storyB]);

    expect(result.wcag22Criteria['2.4.7-focus-visible']).toBe('fail');
  });

  it('should use worst-case-wins: partial beats pass', () => {
    const storyA = makeStoryResult('Default', {
      '1.4.11-non-text-contrast': 'pass',
    });
    const storyB = makeStoryResult('DarkMode', {
      '1.4.11-non-text-contrast': 'partial',
    });

    const result = mergeStoryResults([storyA, storyB]);

    expect(result.wcag22Criteria['1.4.11-non-text-contrast']).toBe('partial');
  });

  it('should let pass override not-applicable', () => {
    const storyA = makeStoryResult('Default', {
      '1.3.5-identify-input-purpose': 'not-applicable',
    });
    const storyB = makeStoryResult('WithInput', {
      '1.3.5-identify-input-purpose': 'pass',
    });

    const result = mergeStoryResults([storyA, storyB]);

    expect(result.wcag22Criteria['1.3.5-identify-input-purpose']).toBe('pass');
  });

  it('should keep not-applicable when all stories agree', () => {
    const storyA = makeStoryResult('Default', {
      '2.5.7-dragging-movements': 'not-applicable',
    });
    const storyB = makeStoryResult('Other', {
      '2.5.7-dragging-movements': 'not-applicable',
    });

    const result = mergeStoryResults([storyA, storyB]);

    expect(result.wcag22Criteria['2.5.7-dragging-movements']).toBe(
      'not-applicable'
    );
  });

  it('should include evidence from the worst status story', () => {
    const storyA = makeStoryResult('Default', {'2.5.8-target-size': 'pass'}, [
      '2.5.8-target-size: All targets meet minimum size',
    ]);
    const storyB = makeStoryResult('Compact', {'2.5.8-target-size': 'fail'}, [
      '2.5.8-target-size: Close button is 18x18px',
    ]);

    const result = mergeStoryResults([storyA, storyB]);

    expect(result.wcag22Criteria['2.5.8-target-size']).toBe('fail');
    expect(result.evidenceParts).toContain(
      '2.5.8-target-size: Close button is 18x18px'
    );
  });

  it('should merge evidence when same worst status across stories', () => {
    const storyA = makeStoryResult('Default', {'2.4.7-focus-visible': 'fail'}, [
      '2.4.7-focus-visible: No focus ring on button',
    ]);
    const storyB = makeStoryResult(
      'WithDropdown',
      {'2.4.7-focus-visible': 'fail'},
      ['2.4.7-focus-visible: No focus ring on dropdown']
    );

    const result = mergeStoryResults([storyA, storyB]);

    expect(result.wcag22Criteria['2.4.7-focus-visible']).toBe('fail');
    const evidenceEntry = result.evidenceParts.find((p) =>
      p.startsWith('2.4.7-focus-visible:')
    );
    expect(evidenceEntry).toBeDefined();
    expect(evidenceEntry).toContain('Default:');
    expect(evidenceEntry).toContain('WithDropdown:');
  });

  it('should handle three stories with escalating severity', () => {
    const storyA = makeStoryResult('Default', {
      '1.4.4-resize-text': 'not-applicable',
    });
    const storyB = makeStoryResult('WithText', {
      '1.4.4-resize-text': 'pass',
    });
    const storyC = makeStoryResult('WithOverflow', {
      '1.4.4-resize-text': 'fail',
    });

    const result = mergeStoryResults([storyA, storyB, storyC]);

    expect(result.wcag22Criteria['1.4.4-resize-text']).toBe('fail');
  });

  it('should produce results for all 22 AI criteria', () => {
    const result = mergeStoryResults([
      makeStoryResult('Default'),
      makeStoryResult('Other'),
    ]);

    for (const key of ALL_AI_CRITERIA) {
      expect(result.wcag22Criteria).toHaveProperty(key);
    }
    expect(Object.keys(result.wcag22Criteria)).toHaveLength(
      ALL_AI_CRITERIA.length
    );
  });
});

describe('findEvidence', () => {
  it('should return evidence for matching criterion key', () => {
    const parts = [
      '1.3.2-meaningful-sequence: Reading order OK',
      '2.5.8-target-size: Button is 24x24px',
    ];

    expect(findEvidence(parts, '2.5.8-target-size')).toBe('Button is 24x24px');
  });

  it('should return empty string when criterion not found', () => {
    const parts = ['1.3.2-meaningful-sequence: Reading order OK'];

    expect(findEvidence(parts, '2.5.8-target-size')).toBe('');
  });

  it('should return empty string for empty evidence array', () => {
    expect(findEvidence([], '1.3.2-meaningful-sequence')).toBe('');
  });
});
