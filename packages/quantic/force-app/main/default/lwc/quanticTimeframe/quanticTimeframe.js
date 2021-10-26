import { api, LightningElement} from 'lwc';

export default class QuanticTimeframe extends LightningElement {
  /**
   * The relative period of time to now.
   * @api
   * @type {'past'|'next'}
   * @defaultValue Defaults to the `past` value.
   */
  @api period = 'past';

  /**
   * The unit used to define:
   * - the start date of the timeframe, if the period is `past`
   * - the end date of the timeframe, if the period is `next`.
   * @api
   * @type {'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year'}
   * @defaultValue Defaults to `day`.
   */
  @api unit = 'day';

  /**
   * The amount of units from which to count.
   * 
   * E.g., 10 days, 1 year, etc.
   * @api
   * @type {number}
   * @defaultValue Defaults to `1`
   */
  @api amount = 1;

  /**
   * The non-localized label for the timeframe. When defined, it will appear instead of the formatted value.
   * @api
   * @type {string}
   */
  @api label;
}
