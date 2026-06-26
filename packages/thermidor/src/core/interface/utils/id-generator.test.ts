import {describe, expect, it} from 'vitest';
import {generateId} from './id-generator.js';

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('returns unique values on successive calls', () => {
    const ids = new Set(Array.from({length: 100}, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
