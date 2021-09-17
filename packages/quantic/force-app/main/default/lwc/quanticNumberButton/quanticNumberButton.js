import {LightningElement, api} from 'lwc';

/**
 * The `QuanticNumberButton` component is used internally to display a button with a numeric label.
 * @category LWC
 * @example
 * <c-quantic-number-button number="1" current="1" ongoto={goto}></c-quantic-number-button>
 */
export default class QuanticNumberButton extends LightningElement {
  @api number;
  @api current;

  get isCurrent() {
    return this.number === this.current;
  }

  goto() {
    this.dispatchEvent(new CustomEvent('goto', {detail: this.number}));
  }

  get variant() {
    return this.number === this.current ? 'brand-outline' : 'brand';
  }
}
