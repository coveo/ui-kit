import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import type {RelativeDateUnit} from '@coveo/headless';
import {LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {Timeframe} from '@/src/components/common/facets/timeframe-facet-common';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {LitElementWithError} from '@/src/decorators/types';

/**
 * The `atomic-timeframe` component defines a timeframe for an `atomic-timeframe-facet`.
 * This component must be a child of an `atomic-timeframe-facet` component.
 *
 * A timeframe represents a span of time relative to the current moment, either in the past or future.
 */
@customElement('atomic-timeframe')
export class AtomicTimeframe
  extends LitElement
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
   * The direction of time relative to the current moment.
   */
  @property({type: String, reflect: true}) public period: 'past' | 'next' =
    'past';

  /**
   * The unit of time for the timeframe (e.g., "day", "week", "month").
   */
  @property({type: String, reflect: true}) public unit!: RelativeDateUnit;

  /**
   * The number of time units for the timeframe.
   */
  @property({type: Number, reflect: true}) public amount = 1;

  /**
   * A custom, non-localized label for the timeframe.
   * When specified, this label appears instead of the auto-generated timeframe description.
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
