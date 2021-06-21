import {Component, Element, Prop, State, h} from '@stencil/core';
import {dispatchNumberFormatEvent} from './format-common';

/**
 * The `atomic-format-unit` component is used for formatting numbers with units.
 * It will set the numerical format on compatible parents according to the options.
 */
@Component({
  tag: 'atomic-format-unit',
  shadow: true,
})
export class AtomicFormatUnit {
  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The unit to use in unit formatting.
   * Leverages the [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat) constructor.
   * Has to be a [sanctionned unit identifier](https://tc39.es/proposal-unified-intl-numberformat/section6/locales-currencies-tz_proposed_out.html#sec-issanctionedsimpleunitidentifier)
   */
  @Prop() public unit!: string;
  /**
   * The unit formatting style to use in unit formatting.
   * - "long" (e.g., 16 litres)
   * - "short" (e.g., 16 l)
   * - "narrow" (e.g., 16l)
   */
  @Prop() public unitDisplay?: 'long' | 'short' | 'narrow' = 'short';

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
      style: 'unit',
      unit: this.unit,
      unitDisplay: this.unitDisplay,
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
