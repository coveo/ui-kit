import type {Context, ContextState} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  language: 'en',
  country: 'US',
  currency: 'USD',
  view: {
    url: 'https://example.com',
  },
} satisfies ContextState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  setLanguage: vi.fn(),
  setCountry: vi.fn(),
  setCurrency: vi.fn(),
  setView: vi.fn(),
  setLocation: vi.fn(),
} satisfies Context;

export const buildFakeContext = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<Context>;
  state?: Partial<ContextState>;
}> = {}): Context =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as Context;
