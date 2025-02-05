import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {DateRangeRequest} from '../facets/range-facets/date-facet-set/interfaces/request.js';
import {NumericRangeRequest} from '../facets/range-facets/numeric-facet-set/interfaces/request.js';
import {searchParametersDefinition} from './search-parameter-schema.js';

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
   * Whether to interpret advanced [Coveo Cloud query syntax](https://docs.coveo.com/en/1814/) in the query.
   */
  enableQuerySyntax?: boolean;

  /**
   * A record of the facets, where the key is the facet id, and value is an array containing the selected values.
   */
  f?: Record<string, string[]>;

  /**
   * A record of the excluded facets, where the key is the facet id, and value is an array containing the excluded values.
   */
  fExcluded?: Record<string, string[]>;

  /**
   * A zero-based index of the first result.
   */
  firstResult?: number;

  /**
   * A record of the numeric facets, where the key is the facet id, and value is an array containing the numeric ranges to request.
   */
  nf?: Record<string, NumericRangeRequest[]>;
  /**
   * A record of the manual numeric facets, where the key is the facet id, and the value is the selected numeric range.
   */
  mnf?: Record<string, NumericRangeRequest>;

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

  /**
   * A record of the static filters, where the key is the static filter id, and value is an array containing the selected static filter captions.
   */
  sf?: Record<string, string[]>;

  /**
   * The active tab id.
   */
  tab?: string;

  /**
   * A record of the automatic facets, where the key is the facet id, and value is an array containing the selected values.
   */
  af?: Record<string, string[]>;
}

export const restoreSearchParameters = createAction(
  'searchParameters/restore',
  (payload: SearchParameters) =>
    validatePayload(payload, searchParametersDefinition)
);

export const restoreTab = createAction(
  'searchParameters/restoreTab',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);
