import {Result} from './result';

export interface SearchResponse {
  results: Result[];
  searchUid: string;
}
