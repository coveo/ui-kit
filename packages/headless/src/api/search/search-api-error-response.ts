import {QueryException} from './search/query-exception';

export interface SearchAPIErrorWithStatusCode {
  statusCode: number;
  message: string;
  type: string;
}

export interface SearchAPIErrorWithExceptionInBody {
  exception: QueryException;
}
