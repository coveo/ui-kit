import {SearchResult} from '../../api/search/SearchResult';
import {SUCCEED_SEARCH, SearchActionTypes} from '../search/searchSlice';

export interface ResultsState {
  list: SearchResult[];
  firstResult: number;
  numberOfResults: number;
}

const resultsInitialState: ResultsState = {
  list: [],
  firstResult: 0,
  numberOfResults: 10,
};

export default function resultsSlice(
  state = resultsInitialState,
  action: SearchActionTypes
): ResultsState {
  switch (action.type) {
    case SUCCEED_SEARCH:
      return {...state, list: action.payload.response.results};
    default:
      return state;
  }
}
