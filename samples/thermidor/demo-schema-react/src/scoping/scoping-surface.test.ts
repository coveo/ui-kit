import {describe, expect, it} from 'vitest';
import {isScopingSurface} from './scoping-surface.js';

describe('isScopingSurface', () => {
  it('recognizes a Scoping block by its surface id', () => {
    expect(isScopingSurface('scoping-0b1c')).toBe(true);
  });

  it('leaves every other block to its turn', () => {
    expect(isScopingSurface('agent-answer')).toBe(false);
    expect(isScopingSurface('ui-scoping-results')).toBe(false);
  });
});
