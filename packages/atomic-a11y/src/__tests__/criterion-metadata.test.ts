import {describe, expect, it} from 'vitest';
import {getCriterionMetadata} from '../data/criterion-metadata.js';

describe('getCriterionMetadata()', () => {
  it('should return metadata for known Level A criterion (1.1.1)', () => {
    const result = getCriterionMetadata('1.1.1');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Non-text Content');
    expect(result?.level).toBe('A');
    expect(result?.wcagVersion).toBe('2.0');
  });

  it('should return metadata for known Level AA criterion (1.4.3)', () => {
    const result = getCriterionMetadata('1.4.3');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Contrast (Minimum)');
    expect(result?.level).toBe('AA');
    expect(result?.wcagVersion).toBe('2.0');
  });

  it('should return undefined for unknown criterion', () => {
    const result = getCriterionMetadata('99.99.99');
    expect(result).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    const result = getCriterionMetadata('');
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-existent criterion ID', () => {
    const result = getCriterionMetadata('0.0.0');
    expect(result).toBeUndefined();
  });
});
