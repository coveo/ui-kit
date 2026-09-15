import {describe, it, expectTypeOf} from 'vitest';
import type {Supports, SearchInterface} from './interface-types.js';
import type {GenerativeUnifiedInterface} from '@/src/public/interfaces/generative-unified.js';

describe('Supports<F> type safety', () => {
  describe('BaseInterface', () => {
    it('accepts an interface that declares the facade', () => {
      expectTypeOf<SearchInterface>().toExtend<Supports<'search'>>();
    });

    it('rejects an interface that does not declare the facade', () => {
      expectTypeOf<GenerativeUnifiedInterface>().not.toExtend<Supports<'search'>>();
    });
  });
});
