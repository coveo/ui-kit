import {Component, Element, Prop, State, h} from '@stencil/core';
import {
  dispatchNumberFormatEvent,
  NumberFormatter,
} from '../../common/formats/format-common';

/**
 * The `atomic-format-unit` component is used for formatting numbers with units.
 * The numerical format of compatible parents will be set according to the properties of this component.
 *
 * @deprecated Use the format properties (unit, unitDisplay, minimumFractionDigits, etc.) directly on the parent component instead of using this component.
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
   * The unit must be [sanctioned unit identifier](https://tc39.es/proposal-unified-intl-numberformat/section6/locales-currencies-tz_proposed_out.html#sec-issanctionedsimpleunitidentifier)
   */
  @Prop({reflect: true}) public unit!: string;
  /**
   * The unit formatting style to use in unit formatting.
   *
   * * "long" (for example, 16 litres)
   * * "short" (for example, 16 l)
   * * "narrow" (for example, 16l)
   */
  @Prop({reflect: true}) public unitDisplay?: 'long' | 'short' | 'narrow' =
    'short';

  componentWillLoad() {
    try {
      dispatchNumberFormatEvent(
        (value, languages) => this.format(value, languages),
        this.host
      );
    } catch (error) {
      this.error = error as Error;
    }
  }

  private format: NumberFormatter = (value, languages) => {
    return value.toLocaleString(languages, {
      style: 'unit',
      unit: this.unit,
      unitDisplay: this.unitDisplay,
    });
  };

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
