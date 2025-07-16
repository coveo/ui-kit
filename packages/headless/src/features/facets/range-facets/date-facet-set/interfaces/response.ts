import type {BaseFacetResponse} from '../../../facet-api/response.js';
import type {FacetValueState} from '../../../facet-api/value.js';

/**
 * The domain of a date facet.
 */
type DateFacetDomain = {
  /**
   * The most recent date available value in the range.
   */
  end: string;
  /**
   * The least recent date available value in the range.
   */
  start: string;
};

export interface DateFacetValue {
  /**
   * The number of results that have the facet value.
   */
  numberOfResults: number;

  /**
   * The starting value for the date range, formatted as `YYYY/MM/DD@HH:mm:ss` or the Relative date format "period-amount-unit"
   */
  start: string;

  /**
   * The ending value for the date range, formatted as `YYYY/MM/DD@HH:mm:ss` or the Relative date format "period-amount-unit"
   */
  end: string;

  /**
   * Whether or not the end value is included in the range.
   */
  endInclusive: boolean;

  /**
   * The state of the facet value, indicating whether it is filtering results (`selected`) or not (`idle`).
   */
  state: FacetValueState;
}

export type DateFacetResponse = BaseFacetResponse<DateFacetValue> & {
  domain: DateFacetDomain;
};
