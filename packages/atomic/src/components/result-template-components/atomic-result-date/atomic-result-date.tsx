import {Component, Prop, Element, State} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import dayjs from 'dayjs';
import {ResultContext} from '../result-template-decorators';

/**
 * The `atomic-result-date` component renders the value of a date result field.
 */
@Component({
  tag: 'atomic-result-date',
  shadow: false,
})
export class AtomicResultDate {
  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The result field which the component should use.
   * This will look for the field in the Result object first, and then in the Result.raw object.
   * It is important to include the necessary field in the ResultList component.
   */
  @Prop() field = 'date';
  /**
   * Available formats: https://day.js.org/docs/en/display/format
   */
  @Prop() format = 'D/M/YYYY';

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

    const parsedValue = dayjs(value as never);
    if (!parsedValue.isValid()) {
      this.error = new Error(
        `Field "${this.field}" does not contain a valid date.`
      );
      this.dateToRender = null;
      return;
    }

    this.dateToRender = parsedValue.format(this.format);
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
