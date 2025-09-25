import type {SearchStatus, SearchStatusState} from '@coveo/headless';
import {genericSubscribe} from '../common';

export const defaultSearchStatusState: SearchStatusState = {
  hasError: false,
  isLoading: false,
  hasResults: true,
  firstSearchExecuted: true,
};

export const defaultSearchStatusImplementation: SearchStatus = {
  subscribe: genericSubscribe,
  state: defaultSearchStatusState,
};

export const buildFakeSearchStatus = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<SearchStatus>;
  state?: Partial<SearchStatusState>;
}> = {}): SearchStatus =>
  ({
    ...defaultSearchStatusImplementation,
    ...implementation,
    state: {...defaultSearchStatusState, ...state},
  }) as SearchStatus;
