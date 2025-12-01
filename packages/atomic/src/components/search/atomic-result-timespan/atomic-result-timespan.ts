import {Schema, StringValue} from '@coveo/bueno';
import {type Result, ResultTemplatesHelpers} from '@coveo/headless';
import dayjs from 'dayjs';
import type {DurationUnitType} from 'dayjs/plugin/duration';
import duration from 'dayjs/plugin/duration';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {LightDomMixin} from '@/src/mixins/light-dom';

dayjs.extend(duration);

/**
 * The `atomic-result-timespan` component renders a target result number field value as a duration.
 */
@customElement('atomic-result-timespan')
@bindings()
export class AtomicResultTimespan
  extends LightDomMixin(InitializeBindingsMixin(LitElement))
  implements InitializableComponent<Bindings>
{
  private static readonly propsSchema = new Schema({
    field: new StringValue({required: true, emptyAllowed: false}),
    unit: new StringValue({
      constrainTo: [
        'milliseconds',
        'ms',
        'seconds',
        's',
        'minutes',
        'm',
        'hours',
        'h',
        'days',
        'd',
        'weeks',
        'w',
        'months',
        'M',
        'years',
        'y',
      ],
    }),
    format: new StringValue({required: false, emptyAllowed: false}),
  });

  /**
   * The target result numeric field.
   * The component first looks for the field in the Result object, and then in the Result.raw object.
   * It is important to include the necessary field in the `atomic-search-interface` component.
   */
  @property({reflect: true}) public field!: string;
  /**
   * The unit of measurement of the numeric field value.
   * Available units: https://day.js.org/docs/en/durations/creating
   */
  @property({reflect: true}) public unit = 'ms';
  /**
   * The format to apply to the result field value.
   *
   * By default, the format is HH:mm:ss when the duration is under a day, and it is an approximation when longer (days, months or years).
   *
   * The string displayed when there is an approximation can be modified with [localization](https://docs.coveo.com/en/atomic/latest/usage/atomic-localization/).
   *
   * Available formats: https://day.js.org/docs/en/durations/format
   */
  @property({reflect: true}) public format?: string;

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  private resultContext = createResultContextController(this);

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({field: this.field, unit: this.unit, format: this.format}),
      AtomicResultTimespan.propsSchema
    );
  }

  public initialize() {
    if (!this.value) {
      this.error = new Error(`No value found for field ${this.field}`);
      return;
    }
    // biome-ignore lint/suspicious/noGlobalIsNan: isNan is needed here because switching to Number.isNaN would be a breaking change.
    if (isNaN(this.value)) {
      this.error = new Error(
        `Value ${this.value} for field ${this.field} is not a number`
      );
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const durationValue = dayjs.duration(
      this.value,
      this.unit as DurationUnitType
    );

    if (this.format) {
      return html`${durationValue.format(this.format)}`;
    }

    if (durationValue.asYears() >= 1) {
      return html`${this.bindings.i18n.t('approx_year', {
        count: Math.round(durationValue.asYears()),
      })}`;
    }

    if (durationValue.asMonths() >= 1) {
      return html`${this.bindings.i18n.t('approx_month', {
        count: Math.round(durationValue.asMonths()),
      })}`;
    }

    if (durationValue.asDays() >= 1) {
      return html`${this.bindings.i18n.t('approx_day', {
        count: Math.round(durationValue.asDays()),
      })}`;
    }

    return html`${durationValue.format('HH:mm:ss')}`;
  }

  private get value() {
    return ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    ) as number;
  }

  private get result(): Result {
    return this.resultContext.item as Result;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-timespan': AtomicResultTimespan;
  }
}
