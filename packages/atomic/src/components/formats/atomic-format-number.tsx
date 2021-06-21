import {Component, Element, Prop, State, h} from '@stencil/core';
import {dispatchNumberFormatEvent} from './format-common';

/**
 * The `atomic-format-number` component is used for number formatting.
 * It will set the numerical format on compatible parents according to the options.
 */
@Component({
  tag: 'atomic-format-number',
  shadow: true,
})
export class AtomicFormatNumber {
  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The minimum number of integer digits to use.
   */
  @Prop() public minimumIntegerDigits?: number;
  /**
   * The minimum number of fraction digits to use.
   */
  @Prop() public minimumFractionDigits?: number;
  /**
   * The maximum number of fraction digits to use.
   */
  @Prop() public maximumFractionDigits?: number;
  /**
   * The minimum number of significant digits to use.
   */
  @Prop() public minimumSignificantDigits?: number;
  /**
   * The maximum number of significant digits to use.
   */
  @Prop() public maximumSignificantDigits?: number;

  componentWillLoad() {
    try {
      dispatchNumberFormatEvent(
        (value, languages) => this.format(value, languages),
        this.host
      );
    } catch (error) {
      this.error = error;
    }
  }

  private format(value: number | string, languages: string[]) {
    return parseFloat(`${value}`).toLocaleString(languages, {
      minimumIntegerDigits: this.minimumIntegerDigits,
      minimumFractionDigits: this.minimumFractionDigits,
      maximumFractionDigits: this.maximumFractionDigits,
      minimumSignificantDigits: this.minimumSignificantDigits,
      maximumSignificantDigits: this.maximumSignificantDigits,
    });
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }
  }
}
