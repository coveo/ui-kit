import {NumericRangeRequest} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/request';
import {FacetValueState} from '../../facet/headless-facet';

export interface NumericRangeOptions {
  /**
   * The start value of the range.
   */
  start: number;

  /**
   * The end value of the range.
   */
  end: number;

  /**
   * Whether to include the `end` value in the range.
   *
   * @defaultValue `false`
   */
  endInclusive?: boolean;

  /**
   * The current facet value state.
   *
   * @defaultValue `idle`
   */
  state?: FacetValueState;
}

/**
 * Creates a `NumericRangeRequest`.
 *
 * @param config - The options with which to create a `NumericRangeRequest`.
 * @returns A new `NumericRangeRequest`.
 */
export function buildNumericRange(
  config: NumericRangeOptions
): NumericRangeRequest {
  return {
    endInclusive: false,
    state: 'idle',
    ...config,
  };
}
