import type {ResultsPerPage as InsightResultsPerPage} from '@coveo/headless/insight';
import {vi} from 'vitest';
import {genericSubscribe} from '../common.js';

export const buildFakeInsightResultsPerPage = (
  options: Partial<InsightResultsPerPage['state']> = {}
): InsightResultsPerPage => {
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
  } as InsightResultsPerPage;
};
