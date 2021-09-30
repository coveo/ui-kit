import {LightningElement, api} from 'lwc';

/**
 * The `QuanticNumberButton` component is used internally to display a button in a set of buttons with numeric labels.
 * @fires CustomEvent#goto
 * @example
 * <c-quantic-number-button number="1" current="1" ongoto={goto}></c-quantic-number-button>
 */
export default class QuanticNumberButton extends LightningElement {
  /**
   * The number to display as button label.
   * @api
   * @type {number}
   */
  @api number;
  /**
   * The selected number in the set of buttons.
   * @api
   * @type {number}
   */
  @api selected;

  get isSelected() {
    return this.number === this.selected;
  }

  get variant() {
    return this.number === this.selected ? 'brand' : 'brand-outline';
  }

  goto() {
    this.dispatchEvent(new CustomEvent('goto', {detail: this.number}));
  }
}
