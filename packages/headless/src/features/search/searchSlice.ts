import {search} from '../../api/search/search';
import {AppThunk} from '../../app/store';
import {SearchResponse} from '../../api/search/SearchResponse';

export const START_SEARCH = 'search/START';
export interface StartSearchAction {
  type: typeof START_SEARCH;
}

export const SUCCEED_SEARCH = 'search/SUCCESS';
export interface SucceedSearchAction {
  type: typeof SUCCEED_SEARCH;
  payload: {
    response: SearchResponse;
  };
}

export const FAIL_SEARCH = 'search/FAIL';
export interface FailSearchAction {
  type: typeof FAIL_SEARCH;
  payload: {
    message: string;
  };
}

export type SearchActionTypes =
  | StartSearchAction
  | SucceedSearchAction
  | FailSearchAction;

export enum SearchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export interface SearchState {
  status: SearchStatus;
}

const searchInitialState: SearchState = {
  status: SearchStatus.IDLE,
};

export function searchSlice(
  state = searchInitialState,
  action: SearchActionTypes
): SearchState {
  switch (action.type) {
    case START_SEARCH:
      return {...state, status: SearchStatus.LOADING};
    case SUCCEED_SEARCH:
      return {...state, status: SearchStatus.SUCCESS};
    case FAIL_SEARCH:
      return {...state, status: SearchStatus.FAIL};
    default:
      return state;
  }
}

export const performSearch = (): AppThunk<SearchActionTypes> => async (
  dispatch,
  getState
) => {
  try {
    dispatch({type: START_SEARCH});

    dispatch({
      type: SUCCEED_SEARCH,
      payload: {response: await search(getState())},
    });
  } catch (err) {
    console.error(err);

    dispatch({
      type: FAIL_SEARCH,
      payload: {
        message: 'Failed performing search',
      },
    });
  }
};
