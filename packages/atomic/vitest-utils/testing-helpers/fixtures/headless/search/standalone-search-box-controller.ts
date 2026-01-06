import type {
  StandaloneSearchBox,
  StandaloneSearchBoxState,
} from '@coveo/headless';
import {vi} from 'vitest';

export const defaultState: StandaloneSearchBoxState = {
  value: '',
  suggestions: [],
  isLoading: false,
  isLoadingSuggestions: false,
  redirectTo: '',
  analytics: {
    cause: '',
    metadata: {},
  },
};

export const defaultImplementation = {
  subscribe: vi.fn((subscribedFunction: () => void) => {
    subscribedFunction();
  }) as unknown as StandaloneSearchBox['subscribe'],
  submit: vi.fn() as StandaloneSearchBox['submit'],
  updateRedirectUrl: vi.fn() as StandaloneSearchBox['updateRedirectUrl'],
  afterRedirection: vi.fn() as StandaloneSearchBox['afterRedirection'],
  state: defaultState,
};

export const buildFakeStandaloneSearchBox = (
  state?: Partial<StandaloneSearchBoxState>,
  methods?: Partial<StandaloneSearchBox>
): StandaloneSearchBox =>
  ({
    ...defaultImplementation,
    ...{state: {...defaultState, ...(state || {})}},
    ...(methods && {...methods}),
  }) as StandaloneSearchBox;
