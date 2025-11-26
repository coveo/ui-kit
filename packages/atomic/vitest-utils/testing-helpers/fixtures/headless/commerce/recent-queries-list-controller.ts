import type {
  RecentQueriesList,
  RecentQueriesState,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const defaultState = {
  queries: ['query1', 'query2', 'query3'],
  maxLength: 5,
  analyticsEnabled: true,
} satisfies RecentQueriesState;

export const defaultImplementation = {
  clear: vi.fn() as unknown as RecentQueriesList['clear'],
  executeRecentQuery:
    vi.fn() as unknown as RecentQueriesList['executeRecentQuery'],
  subscribe: vi.fn((subscribedFunction: () => void) => {
    subscribedFunction();
  }) as unknown as RecentQueriesList['subscribe'],
  state: defaultState,
} satisfies RecentQueriesList;

export const buildFakeRecentQueriesList = (
  state?: Partial<RecentQueriesState>
): RecentQueriesList =>
  ({
    ...defaultImplementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as RecentQueriesList;
