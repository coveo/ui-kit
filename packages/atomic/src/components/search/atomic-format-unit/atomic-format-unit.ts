import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  dispatchNumberFormatEvent,
  type NumberFormatter,
} from '@/src/components/common/formats/format-common.js';
import '@/src/components/common/atomic-component-error/atomic-component-error.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types.js';

/**
 * The `atomic-format-unit` component is used for formatting numbers with units.
 * The numerical format of compatible parents will be set according to the properties of this component.
 */
@customElement('atomic-format-unit')
export class AtomicFormatUnit
  extends LitElement
  implements LitElementWithError
{
  /**
   * The unit to use in unit formatting.
   * Leverages the [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat) constructor.
   * The unit must be [sanctioned unit identifier](https://tc39.es/proposal-unified-intl-numberformat/section6/locales-currencies-tz_proposed_out.html#sec-issanctionedsimpleunitidentifier)
   */
  @property({reflect: true}) unit!: string;

  /**
   * The unit formatting style to use in unit formatting.
   *
   * * "long" (for example, 16 litres)
   * * "short" (for example, 16 l)
   * * "narrow" (for example, 16l)
   */
  @property({reflect: true, attribute: 'unit-display'})
  unitDisplay?: 'long' | 'short' | 'narrow' = 'short';

  @state() public error!: Error;

  private format: NumberFormatter = (value, languages) => {
    return value.toLocaleString(languages, {
      style: 'unit',
      unit: this.unit,
      unitDisplay: this.unitDisplay,
    });
  };

  connectedCallback() {
    super.connectedCallback();
    try {
      dispatchNumberFormatEvent(
        (value, languages) => this.format(value, languages),
        this
      );
    } catch (error) {
      this.error = error as Error;
    }
  }

  @errorGuard()
  render() {
    return html`${nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-format-unit': AtomicFormatUnit;
  }
}
