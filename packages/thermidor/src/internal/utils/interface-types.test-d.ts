import {describe, it, expectTypeOf} from 'vitest';
import type {Supports} from './interface-types.js';
import type {SearchInterface} from '@/src/public/interfaces/search.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {CommerceInterface} from '@/src/public/interfaces/commerce.js';
import type {
  SortCriterionFor,
  CommerceSortCriterion,
  SearchSortCriterion,
} from '@/src/internal/features/sort/index.js';

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

describe('SortCriterionFor narrowing', () => {
  it('narrows to CommerceSortCriterion for CommerceInterface', () => {
    expectTypeOf<SortCriterionFor<CommerceInterface>>().toEqualTypeOf<CommerceSortCriterion>();
  });
  it('narrows to SearchSortCriterion for SearchInterface', () => {
    expectTypeOf<SortCriterionFor<SearchInterface>>().toEqualTypeOf<SearchSortCriterion>();
  });
});
