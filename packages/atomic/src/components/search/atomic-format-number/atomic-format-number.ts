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
 * The `atomic-format-number` component is used for number formatting.
 * The numerical format of compatible parents will be set according to the properties of this component.
 */
@customElement('atomic-format-number')
export class AtomicFormatNumber
  extends LitElement
  implements LitElementWithError
{
  /**
   * The minimum number of integer digits to use.
   */
  @property({type: Number, reflect: true, attribute: 'minimum-integer-digits'})
  minimumIntegerDigits?: number;

  /**
   * The minimum number of fraction digits to use.
   */
  @property({type: Number, reflect: true, attribute: 'minimum-fraction-digits'})
  minimumFractionDigits?: number;

  /**
   * The maximum number of fraction digits to use.
   */
  @property({type: Number, reflect: true, attribute: 'maximum-fraction-digits'})
  maximumFractionDigits?: number;

  /**
   * The minimum number of significant digits to use.
   */
  @property({
    type: Number,
    reflect: true,
    attribute: 'minimum-significant-digits',
  })
  minimumSignificantDigits?: number;

  /**
   * The maximum number of significant digits to use.
   */
  @property({
    type: Number,
    reflect: true,
    attribute: 'maximum-significant-digits',
  })
  maximumSignificantDigits?: number;

  @state() public error!: Error;

  private format: NumberFormatter = (value, languages) => {
    return value.toLocaleString(languages, {
      minimumIntegerDigits: this.minimumIntegerDigits,
      minimumFractionDigits: this.minimumFractionDigits,
      maximumFractionDigits: this.maximumFractionDigits,
      minimumSignificantDigits: this.minimumSignificantDigits,
      maximumSignificantDigits: this.maximumSignificantDigits,
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
    'atomic-format-number': AtomicFormatNumber;
  }
}
