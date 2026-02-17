import {describe, expect, it} from 'vitest';
import {
  buildAxeRuleCriteriaMap,
  extractCriteriaFromTags,
} from '../data/axe-rule-mappings.js';

describe('extractCriteriaFromTags()', () => {
  it('should convert single wcag tag to criterion ID', () => {
    const result = extractCriteriaFromTags(['wcag143']);
    expect(result).toEqual(['1.4.3']);
  });

  it('should convert multiple wcag tags to criterion IDs', () => {
    const result = extractCriteriaFromTags(['wcag111', 'wcag412']);
    expect(result).toEqual(['1.1.1', '4.1.2']);
  });

  it('should filter out non-wcag tags', () => {
    const result = extractCriteriaFromTags(['best-practice', 'cat.color']);
    expect(result).toEqual([]);
  });

  it('should filter non-wcag tags and extract wcag tags from mixed array', () => {
    const result = extractCriteriaFromTags([
      'wcag143',
      'best-practice',
      'wcag111',
    ]);
    expect(result).toEqual(['1.4.3', '1.1.1']);
  });

  it('should handle multi-digit criterion numbers', () => {
    const result = extractCriteriaFromTags(['wcag1310']);
    expect(result).toEqual(['1.3.10']);
  });

  it('should return empty array for empty input', () => {
    const result = extractCriteriaFromTags([]);
    expect(result).toEqual([]);
  });

  it('should handle readonly array input', () => {
    const tags: readonly string[] = ['wcag111', 'wcag222'];
    const result = extractCriteriaFromTags(tags);
    expect(result).toEqual(['1.1.1', '2.2.2']);
  });

  it('should ignore invalid wcag tag formats', () => {
    const result = extractCriteriaFromTags(['wcag', 'wcag11', 'wcag11111']);
    expect(result).toEqual([]);
  });
});

describe('buildAxeRuleCriteriaMap()', () => {
  it('should return a Map instance', () => {
    const result = buildAxeRuleCriteriaMap();
    expect(result).toBeInstanceOf(Map);
  });

  it('should return non-empty Map', () => {
    const result = buildAxeRuleCriteriaMap();
    expect(result.size).toBeGreaterThan(0);
  });

  it('should have string keys and string array values', () => {
    const result = buildAxeRuleCriteriaMap();
    for (const [key, value] of result.entries()) {
      expect(typeof key).toBe('string');
      expect(Array.isArray(value)).toBe(true);
      expect(value.every((item) => typeof item === 'string')).toBe(true);
    }
  });

  it('should map "color-contrast" rule to WCAG criterion 1.4.3', () => {
    const result = buildAxeRuleCriteriaMap();
    const criteria = result.get('color-contrast');
    expect(criteria).toBeDefined();
    expect(criteria).toContain('1.4.3');
  });

  it('should have sorted criterion IDs for each rule', () => {
    const result = buildAxeRuleCriteriaMap();
    for (const criteria of result.values()) {
      const sorted = [...criteria].sort((a, b) =>
        a.localeCompare(b, 'en-US', {numeric: true})
      );
      expect(criteria).toEqual(sorted);
    }
  });

  it('should not include rules without wcag tags', () => {
    const result = buildAxeRuleCriteriaMap();
    for (const [, criteria] of result.entries()) {
      expect(criteria.length).toBeGreaterThan(0);
    }
  });
});
