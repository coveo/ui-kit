import {describe, expect, it} from 'vitest';
import {getA2UIMessages} from './surfaces.js';

describe('getA2UIMessages', () => {
  it('passes raw A2-UI operations through and honors activity replacement', () => {
    const previousOperation = {version: 'v0.9', createSurface: {surfaceId: 'old'}};
    const replacementOperation = {version: 'v0.9', createSurface: {surfaceId: 'catalog'}};

    expect(
      getA2UIMessages([
        {
          id: 'old',
          kind: 'a2ui-surface',
          replace: false,
          payload: {a2ui_operations: [previousOperation]},
        },
        {
          id: 'catalog',
          kind: 'a2ui-surface',
          replace: true,
          payload: {a2ui_operations: [replacementOperation]},
        },
      ])
    ).toEqual([replacementOperation]);
  });
});
