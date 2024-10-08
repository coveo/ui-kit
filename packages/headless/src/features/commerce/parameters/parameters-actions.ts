import {DateRangeRequest} from '../../facets/range-facets/date-facet-set/interfaces/request.js';
import {NumericRangeRequest} from '../../facets/range-facets/numeric-facet-set/interfaces/request.js';
import {SortCriterion} from '../sort/sort.js';

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
   * A record of manual numeric facets, where the key is the facet id, and the value is an array containing the numeric ranges to request.
   */
  mnf?: Record<string, NumericRangeRequest[]>;

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
