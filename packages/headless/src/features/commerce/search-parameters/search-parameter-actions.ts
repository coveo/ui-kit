import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {searchParametersDefinition,} from './search-parameter-schema';
import {DateRangeRequest} from '../../facets/range-facets/date-facet-set/interfaces/request';
import {NumericRangeRequest} from '../../facets/range-facets/numeric-facet-set/interfaces/request';
import {SortCriterion} from '../sort/sort';

export interface Parameters {
  /**
   * A record of the facets, where the key is the facet id, and value is an array containing the selected values.
   */
  f?: Record<string, string[]>;

  /**
   * A record of the category facets, where the key is the facet id, and value is an array containing the parts of the selected path.
   */
  cf?: Record<string, string[]>;

  /**
   * A record of the date facets, where the key is the facet id, and value is an array containing the date ranges to request.
   */
  df?: Record<string, DateRangeRequest[]>;

  /**
   * A record of the numeric facets, where the key is the facet id, and value is an array containing the numeric ranges to request.
   */
  nf?: Record<string, NumericRangeRequest[]>;

  /**
   * The sort expression to order returned results by.
   */
  sortCriteria?: SortCriterion;

  /**
   * The zero-based index of the active page.
   */
  page?: number;

  /**
   * The number of results per page.
   */
  perPage?: number;
}

/**
 * The parameters affecting the search response.
 */
export interface CommerceSearchParameters extends Parameters {
  /**
   * The query.
   */
  q?: string;
}

export const restoreSearchParameters = createAction(
  'commerce/searchParameters/restore',
  (payload: CommerceSearchParameters) =>
    validatePayload(payload, searchParametersDefinition)
);

