import {QueryException} from './search/query-exception';

export interface SearchAPIErrorWithStatusCode {
  /**
   * The HTTP status code.
   */
  statusCode: number;

  /**
   * The error message.
   */
  message: string;

  /**
   * The error stack.
   */
  stack?: string;

  /**
   * The error type.
   */
  type: string;
}

export interface SearchAPIErrorWithExceptionInBody {
  exception: QueryException;
}
