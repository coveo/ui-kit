import {Context, ContextState} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const defaultState = {
  language: 'en',
  country: 'US',
  currency: 'USD',
  view: {url: 'https://www.example.com', title: 'Example'},
};

export const defaultImplementation = {
  addReducers: vi.fn(),
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
    return {unsubscribe: vi.fn()};
  },
  setLanguage: vi.fn((language: string) => {
    defaultState.language = language;
  }),
  state: defaultState,
};

export const buildFakeContext = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<Context>;
  state?: Partial<ContextState>;
}>): Context => {
  return {
    ...defaultImplementation,
    ...implementation,
    ...(state && {state: {...defaultState, ...state}}),
  } as Context;
};
