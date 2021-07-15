import {BaseRangeFacetRequest} from '../../generic/interfaces/request';
import {CurrentValues, Type} from '../../../facet-api/request';
import {FacetValueState} from '../../../facet-api/value';
import {RelativeDate, relativeDateDefinition} from '../relative-date';
import {requiredNonEmptyString} from '../../../../../utils/validate-payload';
import {BooleanValue, RecordValue} from '@coveo/bueno';

/**
 * The options defining a value to display in a `DateFacet`.
 */
export interface DateRangeRequest {
  /**
   * The start value of the range, formatted as `YYYY/MM/DD@HH:mm:ss`.
   */
  start: string;

  /**
   * The end value of the range, formatted as `YYYY/MM/DD@HH:mm:ss`.
   */
  end: string;

  /**
   * Whether to include the `end` value in the range.
   */
  endInclusive: boolean;

  /**
   * The current facet value state.
   */
  state: FacetValueState;

  /**
   * When defined, the start & end values will adapt to the current time.
   */
  relativeDate?: RelativeDate;
}

export const dateRangeRequestDefinition = {
  start: requiredNonEmptyString,
  end: requiredNonEmptyString,
  endInclusive: new BooleanValue({required: true}),
  state: requiredNonEmptyString,
  relativeDate: new RecordValue({
    options: {required: false},
    values: relativeDateDefinition,
  }),
};

export interface DateFacetRequest
  extends BaseRangeFacetRequest,
    CurrentValues<DateRangeRequest>,
    Type<'dateRange'> {}
