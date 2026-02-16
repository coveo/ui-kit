import type {SearchBox, SearchBoxState} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  value: '',
  suggestions: [],
  isLoading: false,
  isLoadingSuggestions: false,
  searchBoxId: 'search-box-id',
} satisfies SearchBoxState;

export const defaultImplementation = {
  subscribe: genericSubscribe as unknown as SearchBox['subscribe'],
  state: defaultState,
  updateText: vi.fn(),
  clear: vi.fn(),
  showSuggestions: vi.fn(),
  selectSuggestion: vi.fn(),
  submit: vi.fn(),
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
