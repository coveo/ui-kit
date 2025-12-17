import {RelativeDateUnit} from '@coveo/headless';
import {Component, Prop} from '@stencil/core';
import {Timeframe} from '../facets/stencil-timeframe-facet-common';


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
   * The relative period of time to now.
   */
  @Prop({reflect: true}) public period: 'past' | 'next' = 'past';

  /**
   * The unit used to define:
   * - the start date of the timeframe, if the period is `past`
   * - the end date of the timeframe, if the period is `future`
   */
  @Prop({reflect: true}) public unit!: RelativeDateUnit;

  /**
   * The amount of units from which to count.
   *
   * For example, 10 days, 1 year, etc.
   */
  @Prop({reflect: true}) public amount = 1;

  /**
   * The non-localized label for the timeframe. When defined, it will appear instead of the formatted value.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @Prop({reflect: true}) public label?: string;
}
