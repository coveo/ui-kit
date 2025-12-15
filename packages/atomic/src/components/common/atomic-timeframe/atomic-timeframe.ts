import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import type {RelativeDateUnit} from '@coveo/headless';
import {LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {Timeframe} from '@/src/components/common/facets/timeframe-facet-common';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {LitElementWithError} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';

/**
 * The `atomic-timeframe` component defines a timeframe of an `atomic-timeframe-facet`, and therefore must be defined within an `atomic-timeframe-facet` component.
 *
 * A timeframe is a span of time from now to a specific time in the past.
 */
@customElement('atomic-timeframe')
export class AtomicTimeframe
  extends LightDomMixin(LitElement)
  implements Timeframe, LitElementWithError
{
  private static readonly propsSchema = new Schema({
    period: new StringValue({
      constrainTo: ['past', 'next'],
      required: false,
    }),
    unit: new StringValue({
      constrainTo: [
        'minute',
        'hour',
        'day',
        'week',
        'month',
        'quarter',
        'year',
      ],
      required: true,
      emptyAllowed: false,
    }),
    amount: new NumberValue({min: 1, required: false}),
  });
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

  @state() public error!: Error;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({period: this.period, unit: this.unit, amount: this.amount}),
      AtomicTimeframe.propsSchema,
      false
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-timeframe': AtomicTimeframe;
  }
}
