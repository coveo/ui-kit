import {Schema, StringValue} from '@coveo/bueno';
import {type Result, ResultTemplatesHelpers} from '@coveo/headless';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import updateLocale from 'dayjs/plugin/updateLocale';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {parseDate} from '@/src/utils/date-utils';

dayjs.extend(calendar);
dayjs.extend(updateLocale);

/**
 * The `atomic-result-date` component renders the value of a date result field.
 */
@customElement('atomic-result-date')
@bindings()
export class AtomicResultDate
  extends LightDomMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  /**
   * The result field which the component should use.
   * This will look for the field in the Result object first, and then in the Result.raw object.
   * It is important to include the necessary field in the `atomic-search-interface` component.
   */
  @property({type: String, reflect: true}) public field = 'date';

  /**
   * The format of the date.
   * Available formats: https://day.js.org/docs/en/display/format
   */
  @property({type: String, reflect: true}) public format = 'D/M/YYYY';

  /**
   * Whether the date should display in the [relative time format](https://day.js.org/docs/en/plugin/calendar).
   *
   * To modify the relative time string, use the [localization feature](https://docs.coveo.com/en/atomic/latest/usage/atomic-localization/).
   */
  @property({type: Boolean, reflect: true, attribute: 'relative-time'})
  public relativeTime = false;

  @state() public bindings!: Bindings;

  @state() public error!: Error;

  @state() private result!: Result;

  private resultController = createResultContextController(this);

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        field: this.field,
        format: this.format,
      }),
      new Schema({
        field: new StringValue({required: true, emptyAllowed: false}),
        format: new StringValue({required: false, emptyAllowed: false}),
      }),
      false
    );
  }

  public initialize() {
    if (!this.result && this.resultController.item) {
      const item = this.resultController.item;
      if ('result' in item) {
        this.result = item.result;
      } else {
        this.result = item;
      }
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.result && this.field, () => this.renderDate())}`;
  }

  private renderDate() {
    const dateToRender = this.getDateToRender();
    if (dateToRender === null) {
      this.remove();
      return nothing;
    }
    return html`${dateToRender}`;
  }

  private getDateToRender(): string | null {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );

    if (value === null) {
      return null;
    }

    const parsedValue = parseDate(value as never);
    if (!parsedValue.isValid()) {
      this.error = new Error(
        `Field "${this.field}" does not contain a valid date.`
      );
      return null;
    }

    if (this.relativeTime) {
      dayjs.updateLocale(this.bindings.interfaceElement.language, {
        calendar: {
          sameDay: this.bindings.i18n.t('calendar-same-day'),
          nextDay: this.bindings.i18n.t('calendar-next-day'),
          nextWeek: this.bindings.i18n.t('calendar-next-week'),
          lastDay: this.bindings.i18n.t('calendar-last-day'),
          lastWeek: this.bindings.i18n.t('calendar-last-week'),
          sameElse: this.format,
        },
      });
      return parsedValue.calendar();
    }

    return parsedValue.format(this.format);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-date': AtomicResultDate;
  }
}
