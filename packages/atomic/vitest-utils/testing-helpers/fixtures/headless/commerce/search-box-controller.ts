import type {SearchBox, SearchBoxState} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const defaultState = {
  value: '',
  suggestions: [],
  isLoading: false,
  isLoadingSuggestions: false,
  searchBoxId: 'search-box-id',
} satisfies SearchBoxState;

export const defaultImplementation = {
  subscribe: vi.fn((subscribedFunction: () => void) => {
    subscribedFunction();
  }) as unknown as SearchBox['subscribe'],
  state: defaultState,
} satisfies SearchBox;

export const buildFakeSearchBox = (
  state?: Partial<SearchBoxState>,
  methods?: Partial<SearchBox>
): SearchBox =>
  ({
    ...defaultImplementation,
    ...{state: {...defaultState, ...(state || {})}},
    ...(methods && {...methods}),
  }) as SearchBox;
