import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, Prop, Element, State} from '@stencil/core';
import dayjs from 'dayjs/esm/index';
import calendar from 'dayjs/esm/plugin/calendar';
import updateLocale from 'dayjs/esm/plugin/updateLocale/index';
import {parseDate} from '../../../../utils/date-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';

dayjs.extend(calendar);
dayjs.extend(updateLocale);

/**
 * The `atomic-result-date` component renders the value of a date result field.
 */
@Component({
  tag: 'atomic-result-date',
  shadow: false,
})
export class AtomicResultDate implements InitializableComponent {
  @InitializeBindings()
  public bindings!: Bindings;

  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The result field which the component should use.
   * This will look for the field in the Result object first, and then in the Result.raw object.
   * It is important to include the necessary field in the `atomic-search-interface` component.
   */
  @Prop({reflect: true}) field = 'date';
  /**
   * Available formats: https://day.js.org/docs/en/display/format
   */
  @Prop({reflect: true}) format = 'D/M/YYYY';

  /**
   * Whether the date should display in the [relative time format](https://day.js.org/docs/en/plugin/calendar).
   *
   * To modify the relative time string, use the [localization feature](https://docs.coveo.com/en/atomic/latest/usage/atomic-localization/).
   */
  @Prop({reflect: true}) relativeTime?: boolean;

  private dateToRender: string | null = null;

  private updateDateToRender() {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );

    if (value === null) {
      this.dateToRender = null;
      return;
    }

    const parsedValue = parseDate(value as never);
    if (!parsedValue.isValid()) {
      this.error = new Error(
        `Field "${this.field}" does not contain a valid date.`
      );
      this.dateToRender = null;
      return;
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
      this.dateToRender = parsedValue.calendar();
    } else {
      this.dateToRender = parsedValue.format(this.format);
    }
  }

  public componentWillRender() {
    this.updateDateToRender();
  }

  public render() {
    if (this.dateToRender === null) {
      this.host.remove();
      return;
    }
    return this.dateToRender;
  }
}
