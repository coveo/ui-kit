import {Result, getResults, SearchResponse} from '../../api/searchAPI';
import {AppThunk} from '../../app/store';

const FETCH_RESULTS_START = 'FETCH_RESULTS_START';
export interface FetchResultsStartAction {
  type: typeof FETCH_RESULTS_START;
}
const FETCH_RESULTS_SUCCESS = 'FETCH_RESULTS_SUCCESS';
export interface FetchResultsSuccessAction {
  type: typeof FETCH_RESULTS_SUCCESS;
  payload: {
    response: SearchResponse;
  };
}
const FETCH_RESULTS_FAIL = 'FETCH_RESULTS_FAIL';
export interface FetchResultsFailAction {
  type: typeof FETCH_RESULTS_FAIL;
  payload: {
    errorMsg: string;
  };
}

type ResultsActionTypes =
  | FetchResultsStartAction
  | FetchResultsSuccessAction
  | FetchResultsFailAction;

export interface ResultsState {
  isLoading: boolean;
  error: null | string;
  results: Result[];
}

const resultsInitialState: ResultsState = {
  isLoading: false,
  error: null,
  results: [],
};

export function resultsSlice(
  state = resultsInitialState,
  action: ResultsActionTypes
): ResultsState {
  switch (action.type) {
    case FETCH_RESULTS_START:
      return {...state, isLoading: true};
    case FETCH_RESULTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        results: action.payload.response.results,
      };
    case FETCH_RESULTS_FAIL:
      return {...state, isLoading: false, error: action.payload.errorMsg};
    default:
      return state;
  }
}

export const fetchResults = (): AppThunk<ResultsActionTypes> => async dispatch => {
  try {
    dispatch({type: 'FETCH_RESULTS_START'});

    const response = await getResults();

    dispatch({
      type: FETCH_RESULTS_SUCCESS,
      payload: {response},
    });
  } catch (err) {
    console.error(err);
    dispatch({
      type: FETCH_RESULTS_FAIL,
      payload: {errorMsg: 'Fetching results failed'},
    });
  }
};
