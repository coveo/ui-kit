import {createAction} from '@reduxjs/toolkit';
import {SearchRequest} from '../../api/search/search/search-request';
import {validatePayload} from '../../utils/validate-payload';
import {DateRangeRequest} from '../facets/range-facets/date-facet-set/interfaces/request';
import {NumericRangeRequest} from '../facets/range-facets/numeric-facet-set/interfaces/request';
import {searchParametersDefinition} from './search-parameter-schema';

type FacetParameters = {
  f: Record<string, string[]>;
  cf: Record<string, string[]>;
  nf: Record<string, NumericRangeRequest[]>;
  df: Record<string, DateRangeRequest[]>;
};

export type SearchParameters = Omit<
  SearchRequest,
  | 'organizationId'
  | 'accessToken'
  | 'visitorId'
  | 'url'
  | 'enableDidYouMean'
  | 'fieldsToInclude'
  | 'facetOptions'
  | 'facets'
  | 'searchHub'
  | 'pipeline'
  | 'context'
> &
  Partial<FacetParameters>;

/** Restores search parameters from e.g. a url*/
export const restoreSearchParameters = createAction(
  'searchParameters/restore',
  (payload: SearchParameters) =>
    validatePayload(payload, searchParametersDefinition)
);
