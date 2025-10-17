import type {ResultsPerPage} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common.js';

export const buildFakeResultsPerPage = (
  options: Partial<ResultsPerPage['state']> = {}
): ResultsPerPage => {
  const defaultState = {
    numberOfResults: 10,
    ...options,
  };

  return {
    state: defaultState,
    onChange: vi.fn(),
    subscribe: genericSubscribe,
    set: vi.fn(),
    isSetTo: vi.fn().mockReturnValue(true),
  } as ResultsPerPage;
};
