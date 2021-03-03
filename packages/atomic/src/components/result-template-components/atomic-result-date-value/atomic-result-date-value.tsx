import {Component, Prop, Element} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import dayjs from 'dayjs';
import {ResultContext} from '../result-template-decorators';

/**
 * The ResulDateValue component renders the value of a date result property.
 */
@Component({
  tag: 'atomic-result-date-value',
  shadow: false,
})
export class AtomicResultDateValue {
  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  /**
   * The result property which the component should use.
   * Will look in the Result object first and then in the Result.raw object for the fields.
   * It is important to include the necessary fields in the ResultList component.
   */
  @Prop() property = 'date';
  /**
   * Available formats: https://day.js.org/docs/en/display/format
   */
  @Prop() format = 'D/M/YYYY';

  public render() {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.property
    );

    if (value === null) {
      this.host.remove();
      return;
    }

    return dayjs(parseInt(`${value}`)).format(this.format);
  }
}
