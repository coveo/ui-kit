import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  dispatchNumberFormatEvent,
  type NumberFormatter,
} from '../../common/formats/format-common';
import '../../common/atomic-component-error/atomic-component-error';

/**
 * The `atomic-format-number` component is used for number formatting.
 * The numerical format of compatible parents will be set according to the properties of this component.
 */

@customElement('atomic-format-number')
export class AtomicFormatNumber extends LitElement {
  @state() public error!: Error;

  /**
   * The minimum number of integer digits to use.
   */
  @property({type: Number, reflect: true})
  public minimumIntegerDigits?: number;

  /**
   * The minimum number of fraction digits to use.
   */
  @property({type: Number, reflect: true})
  public minimumFractionDigits?: number;

  /**
   * The maximum number of fraction digits to use.
   */
  @property({type: Number, reflect: true})
  public maximumFractionDigits?: number;

  /**
   * The minimum number of significant digits to use.
   */
  @property({type: Number, reflect: true})
  public minimumSignificantDigits?: number;

  /**
   * The maximum number of significant digits to use.
   */
  @property({type: Number, reflect: true})
  public maximumSignificantDigits?: number;

  connectedCallback() {
    super.connectedCallback();
    // Delay dispatch to ensure parent listeners are established
    try {
      dispatchNumberFormatEvent(
        (value, languages) => this.format(value, languages),
        this
      );
    } catch (error) {
      this.error = error as Error;
    }
  }

  render() {
    if (this.error) {
      return html`<atomic-component-error .element=${this} .error=${this.error}></atomic-component-error>`;
    }
    return nothing;
  }

  private format: NumberFormatter = (value, languages) => {
    return value.toLocaleString(languages, {
      minimumIntegerDigits: this.minimumIntegerDigits,
      minimumFractionDigits: this.minimumFractionDigits,
      maximumFractionDigits: this.maximumFractionDigits,
      minimumSignificantDigits: this.minimumSignificantDigits,
      maximumSignificantDigits: this.maximumSignificantDigits,
    });
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-format-number': AtomicFormatNumber;
  }
}
