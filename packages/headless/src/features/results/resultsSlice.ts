import {SearchResult} from '../../api/search/SearchResult';
import {SearchActionTypes, SUCCEED_SEARCH} from '../search/searchSlice';

export interface ResultsState {
  list: SearchResult[];
}

const resultsInitialState: ResultsState = {
  list: [],
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
