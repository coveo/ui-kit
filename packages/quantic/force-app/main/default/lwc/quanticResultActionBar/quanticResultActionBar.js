import {LightningElement} from 'lwc';

/**
 *  The `QuanticResultActionBar` component displays the Quantic Result Actions in a proper way with the right styles.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-result-action-bar>
 *   <c-quantic-result-action onclick={actionOne} icon-name="utility:attach" label-when-hover="Action One"></c-quantic-result-action>
 *   <c-quantic-result-action onclick={actionTwo} icon-name="utility:email" label-when-hover="Action Two"></c-quantic-result-action>
 *   <c-quantic-result-action onclick={actionThree} icon-name="utility:chat" label-when-hover="Action Three"></c-quantic-result-action>
 * </c-quantic-result-action-bar>
 */
export default class QuanticResultActionBar extends LightningElement {
  resultActionButtons = [];

  connectedCallback() {
    this.addEventListener('resultactionregister', this.handleButtonRegister);
  }

  disconnectedCallback() {
    this.removeEventListener('resultactionregister', this.handleButtonRegister);
  }

  /**
   * Handles the result action button registration event.
   */
  handleButtonRegister = (event) => {
    event.stopPropagation();
    const callbacks = event.detail;
    const ref = event.target;
    this.resultActionButtons.push({callbacks, ref});
  };

  /**
   * Handles the slot change event.
   */
  handleSlotChange() {
    this.resultActionButtons = this.getSortedButtons(this.resultActionButtons);

    if (this.resultActionButtons.length === 1) {
      this.resultActionButtons[0].callbacks.setOrder(null);
    } else {
      this.resultActionButtons.forEach((resultActionButton, index, array) => {
        const order =
          index === 0
            ? 'first'
            : index === array.length - 1
            ? 'last'
            : 'middle';
        resultActionButton.callbacks.setOrder(order);
      });
    }
  }

  /**
   *  Returns the sorted result action buttons based on their order in the DOM.
   */
  getSortedButtons(buttons) {
    const sortedButtons = Object.values(buttons);

    sortedButtons.sort((a, b) => {
      const position = a.ref.compareDocumentPosition(b.ref);

      if (
        position & Node.DOCUMENT_POSITION_FOLLOWING ||
        position & Node.DOCUMENT_POSITION_CONTAINED_BY
      ) {
        return -1;
      }
      return 1;
    });

    return sortedButtons;
  }
}
