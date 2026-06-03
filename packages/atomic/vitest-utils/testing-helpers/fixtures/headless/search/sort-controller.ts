import type {Sort, SortState} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  sortCriteria: 'relevancy',
} satisfies SortState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  sortBy: vi.fn(),
  isSortedBy: vi.fn(),
} satisfies Sort;

export const buildFakeSort = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<Sort>;
  state?: Partial<SortState>;
}> = {}): Sort =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as Sort;
