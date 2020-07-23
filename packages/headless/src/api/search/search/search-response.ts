import {Result} from './result';
import {FacetResponse} from '../../../features/facets/facet-set/interfaces/response';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../search-api-error-response';
import {QueryCorrection} from './query-corrections';

export interface SearchResponseSuccess {
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  facets: FacetResponse[];
  queryCorrections: QueryCorrection[];
}

export type Search =
  | SearchResponseSuccess
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
