import {LightningElement, api} from 'lwc';

/**
 * The `QuanticCardContainer` component is used internally as a styling container.
 * @category Utility
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

  handleHeaderClick(evt) {
    evt.preventDefault();
    const headerClickEvent = new CustomEvent('headerclick', {});
    this.dispatchEvent(headerClickEvent);
  }

  /**
   * @param {KeyboardEvent} evt
   */
  handleHeaderKeyDown(evt) {
    if (evt.code === 'Enter' || evt.code === 'Space') {
      evt.preventDefault();
      const headerKeyDownEvent = new CustomEvent('headerkeydown', {});
      this.dispatchEvent(headerKeyDownEvent);
    }
  }
}
