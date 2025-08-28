import type {SearchStatus, SearchStatusState} from '@coveo/headless/insight';
import {genericSubscribe} from '../common';

export const defaultSearchStatusState: SearchStatusState = {
  firstSearchExecuted: false,
  isLoading: false,
  hasResults: false,
  hasError: false,
};

export const defaultSearchStatusImplementation = {
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
    ...(state && {state: {...defaultSearchStatusState, ...state}}),
  }) as SearchStatus;
