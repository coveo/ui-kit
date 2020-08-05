import {Result} from './result';
import {FacetResponse} from '../../../features/facets/facet-set/interfaces/response';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../search-api-error-response';
import {QueryCorrection} from './query-corrections';
import {RangeFacetResponse} from '../../../features/facets/range-facets/generic/interfaces/range-facet';
import {CategoryFacetResponse} from '../../../features/facets/category-facet-set/interfaces/response';

type AnyFacetResponse =
  | FacetResponse
  | RangeFacetResponse
  | CategoryFacetResponse;

export interface SearchResponseSuccess {
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  facets: AnyFacetResponse[];
  queryCorrections: QueryCorrection[];
}

export type Search =
  | SearchResponseSuccess
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
