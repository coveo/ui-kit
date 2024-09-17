import {LightningElement, api} from 'lwc';

/**
 * The `QuanticCardContainer` component is used internally as a styling container.
 * @category Utility
 * @fires CustomEvent#quantic__headerclick
 * @fires CustomEvent#quantic__headerkeydown
 * @example
 * <c-quantic-card-container title="Card Example"></c-quantic-card-container>
 */
export default class QuanticCardContainer extends LightningElement {
  /**
   * The title label to display in the card header.
   * @api
   * @type {string}
   */
  @api title;

  /**
   * Sets the focus on the card header.
   * @api
   * @type {VoidFunction}
   */
  @api setFocusOnHeader() {
    const focusTarget = this.template.querySelector('.card_focusable-header');
    if (focusTarget) {
      // @ts-ignore
      focusTarget.focus();
    }
  }

  handleHeaderClick(evt) {
    evt.preventDefault();
    const headerClickEvent = new CustomEvent('quantic__headerclick', {});
    this.dispatchEvent(headerClickEvent);
  }

  handleHeaderKeyDown(evt) {
    if (evt.code === 'Enter' || evt.code === 'Space') {
      evt.preventDefault();
      const headerKeyDownEvent = new CustomEvent('quantic__headerkeydown', {});
      this.dispatchEvent(headerKeyDownEvent);
    }
  }
}
