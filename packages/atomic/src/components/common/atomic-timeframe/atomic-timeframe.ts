import type {RelativeDateUnit} from '@coveo/headless';
import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {Timeframe} from '@/src/components/common/facets/timeframe-facet-common';
import {LightDomMixin} from '@/src/mixins/light-dom';

/**
 * The `atomic-timeframe` component defines a timeframe of an `atomic-timeframe-facet`, and therefore must be defined within an `atomic-timeframe-facet` component.
 *
 * A timeframe is a span of time from now to a specific time in the past.
 */
@customElement('atomic-timeframe')
export class AtomicTimeframe
  extends LightDomMixin(LitElement)
  implements Timeframe
{
  /**
   * The relative period of time to now.
   */
  @property({type: String, reflect: true}) public period: 'past' | 'next' =
    'past';

  /**
   * The unit used to define:
   * - the start date of the timeframe, if the period is `past`
   * - the end date of the timeframe, if the period is `future`
   */
  @property({type: String, reflect: true}) public unit!: RelativeDateUnit;

  /**
   * The amount of units from which to count.
   *
   * For example, 10 days, 1 year, etc.
   */
  @property({type: Number, reflect: true}) public amount = 1;

  /**
   * The non-localized label for the timeframe. When defined, it will appear instead of the formatted value.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @property({type: String, reflect: true}) public label?: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-timeframe': AtomicTimeframe;
  }
}
