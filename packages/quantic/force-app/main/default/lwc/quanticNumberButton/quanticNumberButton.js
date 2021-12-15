import {LightningElement, api} from 'lwc';

/**
 * The `QuanticNumberButton` component is used internally to display a button in a set of buttons with numeric labels.
 * @fires CustomEvent#select
 * @category Utility
 * @example
 * <c-quantic-number-button number="1" selected onselect={select}></c-quantic-number-button>
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

  get variant() {
    return this.selected ? 'brand' : 'brand-outline';
  }

  select() {
    this.dispatchEvent(new CustomEvent('select', {detail: this.number}));
  }
}
