import type {
  InstantResults,
  InstantResultsState,
  Result,
} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  q: 'the query',
  results: [
    {
      title: 'Result 1',
      uniqueId: '12345',
      uri: 'https://example.com/result1',
      excerpt: 'This is the first result',
      clickUri: 'https://example.com/result1',
      printableUri: 'https://example.com/result1',
      raw: {
        urihash: 'hash12345',
      },
    } as Result,
    {
      title: 'Result 2',
      uniqueId: '67890',
      uri: 'https://example.com/result2',
      excerpt: 'This is the second result',
      clickUri: 'https://example.com/result2',
      printableUri: 'https://example.com/result2',
      raw: {
        urihash: 'hash67890',
      },
    } as Result,
    {
      title: 'Result 3',
      uniqueId: 'abcde',
      uri: 'https://example.com/result3',
      excerpt: 'This is the third result',
      clickUri: 'https://example.com/result3',
      printableUri: 'https://example.com/result3',
      raw: {
        urihash: 'hashabcde',
      },
    } as Result,
  ],
  isLoading: false,
  error: null,
} satisfies InstantResultsState;

export const buildFakeInstantResults = (
  config: Partial<InstantResultsState> = {}
): InstantResults => {
  const fakeState = {
    ...defaultState,
    ...config,
  };

  return {
    state: fakeState,
    updateQuery: vi.fn(),
    clearExpired: vi.fn(),
    subscribe: genericSubscribe,
  };
};
