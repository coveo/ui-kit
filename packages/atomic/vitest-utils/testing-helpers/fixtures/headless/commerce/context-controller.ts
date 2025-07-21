import type {Context, ContextState} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const defaultState = {
  language: 'en',
  country: 'US',
  currency: 'USD',
  view: {
    url: 'https://example.com',
  },
} satisfies ContextState;

export const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
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
}>): Context =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...(state && {state: {...defaultState, ...state}}),
  }) as Context;
