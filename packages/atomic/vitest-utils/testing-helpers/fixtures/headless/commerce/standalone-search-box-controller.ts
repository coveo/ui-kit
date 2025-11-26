import type {
  StandaloneSearchBox,
  StandaloneSearchBoxState,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const defaultState = {
  value: '',
  suggestions: [],
  isLoading: false,
  isLoadingSuggestions: false,
  searchBoxId: 'search-box-id',
  redirectTo: '',
} satisfies StandaloneSearchBoxState;

export const defaultImplementation = {
  subscribe: vi.fn((subscribedFunction: () => void) => {
    subscribedFunction();
  }) as unknown as StandaloneSearchBox['subscribe'],
  submit: vi.fn() as StandaloneSearchBox['submit'],
  updateRedirectUrl: vi.fn() as StandaloneSearchBox['updateRedirectUrl'],
  afterRedirection: vi.fn() as StandaloneSearchBox['afterRedirection'],
  state: defaultState,
} satisfies StandaloneSearchBox;

export const buildFakeStandaloneSearchBox = (
  state?: Partial<StandaloneSearchBoxState>,
  methods?: Partial<StandaloneSearchBox>
): StandaloneSearchBox =>
  ({
    ...defaultImplementation,
    ...{state: {...defaultState, ...(state || {})}},
    ...(methods && {...methods}),
  }) as StandaloneSearchBox;
