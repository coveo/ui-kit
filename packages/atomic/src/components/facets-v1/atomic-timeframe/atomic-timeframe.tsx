import {Component, Prop} from '@stencil/core';
import {RelativeDatePeriod, RelativeDateUnit} from '@coveo/headless';
import {Timeframe} from './timeframe';

/**
 * The `atomic-timeframe` component defines a timeframe of an `atomic-timeframe-facet`, and therefore must be defined within an `atomic-timeframe-facet` component.
 *
 * A timeframe is a span of time from now to a specific time in the past.
 */
@Component({
  tag: 'atomic-timeframe',
  shadow: false,
})
export class AtomicTimeframe implements Timeframe {
  /**
   * The relative period of time.
   */
  @Prop() public period: RelativeDatePeriod = 'past';

  /**
   * The unit used to define:
   * - the start date of the timeframe, if the period is `past`
   * - the end date of the timeframe, if the period is `future`
   */
  @Prop() public unit!: RelativeDateUnit;

  /**
   * The amount of units from which to count.
   *
   * E.g., 10 days, 1 year, etc.
   */
  @Prop() public amount = 1;

  /**
   * If `true`, the date will be returned unshifted. If `false`, the date will be adjusted to UTC time.
   */
  @Prop() public useLocalTime = true;

  /**
   * The non-localized label for the timeframe. When defined, it will appear instead of the formatted value.
   */
  @Prop() public label?: string;
}
