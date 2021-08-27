import {Result} from '../../api/search/search/result';

export interface RecentResultsState {
  results: Result[];
  maxLength: number;
}

export function getRecentResultsInitialState(): RecentResultsState {
  return {
    results: [],
    maxLength: 10,
  };
}
