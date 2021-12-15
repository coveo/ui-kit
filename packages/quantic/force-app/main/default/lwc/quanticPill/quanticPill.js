import {LightningElement, api} from 'lwc';

/**
 * The `QuanticPill` component is used internally to display a deselectable button.
 * @fires CustomEvent#deselect
 * @category Utility
 * @example
 * <c-quantic-pill label="Case" alt-text="Remove Case filter" ondeselect={myDeselectFunction}></c-quantic-pill>
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
  
  deselect() {
    this.dispatchEvent(new CustomEvent('deselect'));
  }
}
