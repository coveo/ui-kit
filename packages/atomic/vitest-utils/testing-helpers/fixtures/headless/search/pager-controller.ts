import type {Pager, PagerState} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultPagerState = {
  currentPage: 1,
  maxPage: 10,
  currentPages: [1, 2, 3, 4, 5],
  hasPreviousPage: true,
  hasNextPage: true,
} satisfies PagerState;

export const defaultPagerImplementation = {
  subscribe: genericSubscribe,
  state: defaultPagerState,
  previousPage: vi.fn(),
  nextPage: vi.fn(),
  selectPage: vi.fn(),
  isCurrentPage: vi.fn((pageNumber: number) => pageNumber === 1),
} satisfies Pager;

export const buildFakePager = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<Pager>;
  state?: Partial<PagerState>;
}> = {}): Pager =>
  ({
    ...defaultPagerImplementation,
    ...implementation,
    ...(state && {state: {...defaultPagerState, ...state}}),
  }) as Pager;
