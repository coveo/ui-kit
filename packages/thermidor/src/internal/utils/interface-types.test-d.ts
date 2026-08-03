import {describe, it, expectTypeOf} from 'vitest';
import type {Supports} from './interface-types.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';

describe('Supports<F> type safety', () => {
  describe('BaseInterface', () => {
    it('accepts an interface that declares the facade', () => {
      expectTypeOf<SearchInterface>().toExtend<Supports<'search'>>();
    });

    it('rejects an interface that does not declare the facade', () => {
      expectTypeOf<GenerativeInterface>().not.toExtend<Supports<'search'>>();
    });
  });
});
