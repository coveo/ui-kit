import {type Sort, SortBy, type SortState} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  availableSorts: [
    {by: SortBy.Fields, fields: [{name: 'foo'}]},
    {by: SortBy.Fields, fields: [{name: 'bar'}]},
  ],
  appliedSort: {
    by: SortBy.Relevance,
  },
} satisfies SortState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  sortBy: vi.fn(),
  isSortedBy: vi.fn(),
  isAvailable: vi.fn(),
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
