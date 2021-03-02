import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {DateRangeRequest} from '../facets/range-facets/date-facet-set/interfaces/request';
import {NumericRangeRequest} from '../facets/range-facets/numeric-facet-set/interfaces/request';
import {searchParametersDefinition} from './search-parameter-schema';

/**
 * The parameters affecting the search response.
 */
export interface SearchParameters {
  /**
   * The advanced query expression.
   */
  aq?: string;

  /**
   * A record of the category facets, where the key is the facet id, and value is an array containing the parts of the selected path.
   */
  cf?: Record<string, string[]>;

  /**
   * The constant query expression.
   */
  cq?: string;

  /**
   * Determines whether to return debug information for a query.
   */
  debug?: boolean;

  /**
   * A record of the date facets, where the key is the facet id, and value is an array containing the date ranges to request.
   */
  df?: Record<string, DateRangeRequest[]>;

  /**
   * Whether to interpret advanced [Coveo Cloud query syntax](https://docs.coveo.com/en/1814/searching-with-coveo/search-prefixes-and-operators) in the query.
   */
  enableQuerySyntax?: boolean;

  /**
   * A record of the facets, where the key is the facet id, and value is an array containing the selected values.
   */
  f?: Record<string, string[]>;

  /**
   * A zero-based index of the first result.
   */
  firstResult?: number;

  /**
   * A record of the numeric facets, where the key is the facet id, and value is an array containing the numeric ranges to request.
   */
  nf?: Record<string, NumericRangeRequest[]>;

  /**
   * The number of results to return.
   */
  numberOfResults?: number;

  /**
   * The query.
   */
  q?: string;

  /**
   * The sort expression to order returned results by.
   */
  sortCriteria?: string;
}

/** Restores search parameters from e.g. a url*/
export const restoreSearchParameters = createAction(
  'searchParameters/restore',
  (payload: SearchParameters) =>
    validatePayload(payload, searchParametersDefinition)
);
