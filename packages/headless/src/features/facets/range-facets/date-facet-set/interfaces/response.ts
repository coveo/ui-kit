import {BaseFacetResponse} from '../../../facet-api/response';
import {FacetValueState} from '../../../facet-api/value';

export interface DateFacetValue {
  /**
   * The number of results that have the facet value.
   */
  numberOfResults: number;

  /**
   * The starting value for the date range, formatted as `YYYY/MM/DD@HH:mm:ss`.
   */
  start: string;

  /**
   * The ending value for the date range, formatted as `YYYY/MM/DD@HH:mm:ss`.
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

export type DateFacetResponse = BaseFacetResponse<DateFacetValue>;
