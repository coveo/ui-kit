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
   * Specify the format into which the duration should be formatted.
   *
   * If not specified, will fallback to an algorithm that approximate the duration if it is very long (years, months, days) or HH:mm:ss if under a day.
   *
   * Available formats: https://day.js.org/docs/en/durations/format
   */
  @Prop({reflect: true}) format?: string;

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
    const duration = dayjs.duration(this.value, this.unit as DurationUnitType);
    if (this.format) {
      return duration.format(this.format);
    }

    if (duration.asYears() >= 1) {
      return this.bindings.i18n.t('approx_year', {
        count: Math.round(duration.asYears()),
      });
    }

    if (duration.asMonths() >= 1) {
      return this.bindings.i18n.t('approx_month', {
        count: Math.round(duration.asMonths()),
      });
    }

    if (duration.asDays() >= 1) {
      return this.bindings.i18n.t('approx_day', {
        count: Math.round(duration.asDays()),
      });
    }

    return duration.format('HH:mm:ss');
  }

  private get value() {
    return ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    ) as number;
  }
}
