import {Component, Prop, Element} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import dayjs from 'dayjs';
import {ResultContext} from '../result-template-decorators';

/**
 * The ResulDate component renders the value of a date result field.
 */
@Component({
  tag: 'atomic-result-date',
  shadow: false,
})
export class AtomicResultDate {
  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  /**
   * The result field which the component should use.
   * Will look in the Result object first and then in the Result.raw object for the fields.
   * It is important to include the necessary fields in the ResultList component.
   */
  @Prop() field = 'date';
  /**
   * Available formats: https://day.js.org/docs/en/display/format
   */
  @Prop() format = 'D/M/YYYY';

  private removeComponent() {
    this.host.remove();
  }

  public render() {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );

    if (value === null) {
      return this.removeComponent();
    }

    const parsedValue = dayjs(value as never);
    if (!parsedValue.isValid()) {
      return this.removeComponent();
    }

    try {
      return parsedValue.format(this.format);
    } catch (error) {
      return this.removeComponent();
    }
  }
}
