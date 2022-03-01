import {api, LightningElement} from 'lwc';

/**
 * The `QuanticTimeframe` component defines a timeframe of a `c-quantic-timeframe-facet`, and therefore must be defined within a `c-quantic-timeframe-facet` component.
 *
 * A timeframe is a span of time from now to a specific time in the past, or the future.
 * @category Search
 * @example
 * <c-quantic-timeframe amount="6" unit="month"></c-quantic-timeframe>
 */
export default class QuanticTimeframe extends LightningElement {
  /**
   * The relative period of time.
   * @api
   * @type {'past'|'next'}
   * @defaultValue `'past'`
   */
  @api period = 'past';

  /**
   * The unit used to define:
   * - the start date of the timeframe, if the period is `past`.
   * - the end date of the timeframe, if the period is `next`.
   * @api
   * @type {'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'}
   * @defaultValue `'day'`
   */
  @api unit = 'day';

  /**
   * The amount of the `unit` of time (e.g., `10 days`, `1 year`, etc.).
   * @api
   * @type {number}
   * @defaultValue `1`
   */
  @api amount = 1;

  /**
   * The non-localized label for the timeframe. When defined, it will appear instead of the formatted value.
   * @api
   * @type {string}
   * @defaultValue Defaults to the formatted value based on amount, unit & period.
   */
  @api label;
}
