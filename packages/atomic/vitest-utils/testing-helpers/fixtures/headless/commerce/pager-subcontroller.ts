import type {Pagination, PaginationState} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  page: 0,
  totalPages: 10,
  pageSize: 10,
  totalEntries: 100,
} satisfies PaginationState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  previousPage: vi.fn(),
  selectPage: vi.fn(),
  nextPage: vi.fn(),
  fetchMoreProducts: vi.fn(),
  setPageSize: vi.fn(),
} satisfies Pagination;

export const buildFakePager = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<Pagination>;
  state?: Partial<PaginationState>;
}> = {}): Pagination =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as Pagination;
