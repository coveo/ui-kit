import {PlatformAPIErrorWithStatusCode} from '../platform-client-error-response';
import {QueryException} from './search/query-exception';

export type SearchAPIErrorWithStatusCode = PlatformAPIErrorWithStatusCode;

export interface SearchAPIErrorWithExceptionInBody {
  exception: QueryException;
}
