import type {SearchStatus, SearchStatusState} from '@coveo/headless/insight';
import {genericSubscribe} from '../common';

export const buildFakeSearchStatus = (
  options: {state?: Partial<SearchStatusState>} = {}
): SearchStatus => {
  const defaultState: SearchStatusState = {
    hasResults: true,
    firstSearchExecuted: false,
    hasError: false,
    isLoading: false,
    ...options.state,
  };

  return {
    state: defaultState,
    subscribe: genericSubscribe,
  } as SearchStatus;
};
