import type {DateRangeRequest} from '../../facets/range-facets/date-facet-set/interfaces/request.js';
import type {NumericRangeRequest} from '../../facets/range-facets/numeric-facet-set/interfaces/request.js';
import type {SortCriterion} from '../sort/sort.js';

export interface Parameters {
  /**
   * A record of the facets, where the key is the facet id, and the value is an array containing the selected values.
   */
  f?: Record<string, string[]>;

  /**
   * A record of the facets, where the key is the facet id, and the value is an array containing the excluded values.
   */
  fExcluded?: Record<string, string[]>;

  /**
   * A record of the location facets, where the key is the facet id, and the value is an array containing the selected values.
   */
  lf?: Record<string, string[]>;

  /**
   * A record of the category facets, where the key is the facet id, and the value is an array containing the parts of the selected path.
   */
  cf?: Record<string, string[]>;

  /**
   * A record of the date facets, where the key is the facet id, and the value is an array containing the selected date ranges.
   */
  df?: Record<string, DateRangeRequest[]>;

  /**
   * A record of the date facets, where the key is the facet id, and the value is an array containing the excluded date ranges.
   */
  dfExcluded?: Record<string, DateRangeRequest[]>;

  /**
   * A record of the numeric facets, where the key is the facet id, and the value is an array containing the selected numeric ranges.
   */
  nf?: Record<string, NumericRangeRequest[]>;

  /**
   * A record of the numeric facets, where the key is the facet id, and the value is an array containing the excluded numeric ranges.
   */
  nfExcluded?: Record<string, NumericRangeRequest[]>;

  /**
   * A record of manual numeric facets, where the key is the facet id, and the the value is an array containing the selected manual numeric ranges.
   */
  mnf?: Record<string, NumericRangeRequest[]>;

  /**
   * A record of manual numeric facets, where the key is the facet id, and the value is an array containing the excluded manual numeric ranges.
   */
  mnfExcluded?: Record<string, NumericRangeRequest[]>;

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
