import {Sort, SortBy, SortState} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState: SortState = {
  availableSorts: [
    {by: SortBy.Fields, fields: [{name: 'foo'}]},
    {by: SortBy.Fields, fields: [{name: 'bar'}]},
  ],
  appliedSort: {by: SortBy.Relevance},
};

export const defaultImplementation: Partial<Sort> = {
  subscribe: genericSubscribe,
  state: defaultState,
  sortBy: vi.fn(),
  isSortedBy: vi.fn(),
};

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
    ...(state && {state: {...defaultState, ...state}}),
  }) as Sort;
