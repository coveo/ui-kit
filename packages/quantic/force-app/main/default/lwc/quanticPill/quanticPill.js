import {LightningElement, api} from 'lwc';

/**
 * The `QuanticPill` component is used internally to display a deselectable button.
 * @fires CustomEvent#quantic__deselect
 * @category Utility
 * @example
 * <c-quantic-pill label="Case" alt-text="Remove Case filter" onquantic__deselect={myDeselectFunction}></c-quantic-pill>
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
   * The name of the group if applicable related to the button (for screen readers).
   * @api
   * @type {string}
   */
  @api groupName;
  /**
   * The name of the action if applicable when the button is clicked (for screen readers).
   * @api
   * @type {string}
   */
  @api actionName;

  deselect() {
    this.dispatchEvent(new CustomEvent('quantic__deselect'));
  }

  get alternativeText() {
    let label = this.altText;
    if (this.groupName && this.actionName && this.label) {
      label = `${this.groupName} ${this.label} ${this.actionName}`.trim();
    }
    return label;
  }
}
