import {describe, it, expectTypeOf} from 'vitest';
import type {Supports} from './interface-types.js';
import type {GenerativeUnifiedInterface} from '@/src/public/interfaces/generative-unified.js';

describe('Supports<F> type safety', () => {
  describe('BaseInterface', () => {
    it('accepts an interface that declares the facade', () => {
      expectTypeOf<GenerativeUnifiedInterface>().toExtend<Supports<'conversation'>>();
    });
  });
});
