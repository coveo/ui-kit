import {describe, expect, it} from 'vitest';
import {extractCriteriaFromTags} from '../data/axe-rule-mappings.js';

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
