import type {SearchStatus} from '@coveo/headless';
import {genericSubscribe} from '../common';

export const buildFakeSearchStatus = (
  options: Partial<SearchStatus['state']> = {}
): SearchStatus => {
  const defaultState = {
    hasResults: true,
    firstSearchExecuted: false,
    hasError: false,
    isLoading: false,
    ...options,
  };

  return {
    state: defaultState,
    subscribe: genericSubscribe,
  } as SearchStatus;
};
