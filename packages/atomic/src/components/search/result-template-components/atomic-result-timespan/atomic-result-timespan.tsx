import {Schema, StringValue} from '@coveo/bueno';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, Prop, State} from '@stencil/core';
import dayjs from 'dayjs';
import {DurationUnitType} from 'dayjs/plugin/duration';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../result-template-decorators';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

/**
 * The `atomic-result-timespan` component renders the duration of a number result field.
 */
@Component({
  tag: 'atomic-result-timespan',
})
export class AtomicResultTimespan {
  @InitializeBindings()
  public bindings!: Bindings;

  @ResultContext() private result!: Result;

  @State() public error!: Error;

  /**
   * The result field which the component should use.
   * This will look for the field in the Result object first, and then in the Result.raw object.
   * It is important to include the necessary field in the ResultList component.
   */
  @Prop({reflect: true}) field!: string;
  /**
   * The unit of the field value.
   * Available units: https://day.js.org/docs/en/durations/creating
   */
  @Prop({reflect: true}) unit = 'ms';
  /**
   * Available formats: https://day.js.org/docs/en/durations/format
   */
  @Prop({reflect: true}) format = 'HH:mm:ss';

  public initialize() {
    new Schema({
      field: new StringValue({required: true, emptyAllowed: false}),
    }).validate({
      field: this.field,
    });
    if (!this.value) {
      this.error = new Error(`No value found for field ${this.field}`);
      return;
    }
    if (isNaN(this.value)) {
      this.error = new Error(
        `Value ${this.value} for field ${this.field} is not a number`
      );
    }
  }

  public render() {
    return dayjs
      .duration(this.value, this.unit as DurationUnitType)
      .format(this.format);
  }

  private get value() {
    return ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    ) as number;
  }
}
