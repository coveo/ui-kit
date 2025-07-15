import type {Sort, SortState} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  availableSorts: [
    {by: 'fields', fields: [{name: 'foo'}]},
    {by: 'fields', fields: [{name: 'bar'}]},
  ],
};

export const defaultImplementation = {
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
