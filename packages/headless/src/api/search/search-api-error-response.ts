import {QueryException} from './search/query-exception';

export interface SearchAPIErrorWithStatusCode {
  statusCode: number;
  message: string;
  type: string;
}

export interface SearchAPIErrorWithExceptionInBody {
  exception: QueryException;
}

export function buildDisconnectedError(): SearchAPIErrorWithStatusCode {
  return {
    statusCode: 0,
    type: 'Disconnected',
    message: 'Could not connect',
  };
}
