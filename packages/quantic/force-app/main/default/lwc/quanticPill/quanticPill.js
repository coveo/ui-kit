import {LightningElement, api} from 'lwc';

/**
 * The `QuanticPill` component is used internally to display a deselectable button.
 * @example
 * <c-quantic-pill label="Case" alt-text="Remove Case filter" deselect={myDeselectFunction}></c-quantic-pill>
 */
export default class QuanticPill extends LightningElement {
  /**
   * The value to display inside the button.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The alternative text to be assigned to the button icon.
   * @api
   * @type {string}
   */
  @api altText;
  /**
   * The function to be executed when the pill is clicked.
   * @api
   * @type {Function}
   */
  @api deselect;
}
