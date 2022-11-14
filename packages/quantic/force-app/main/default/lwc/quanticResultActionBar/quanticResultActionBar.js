import {LightningElement} from 'lwc';

export default class QuanticResultActionBar extends LightningElement {
  resultActionButtons = [];

  connectedCallback() {
    this.template.addEventListener(
      'resultactionregister',
      this.handleButtonRegister
    );
  }

  disconnectedCallback() {
    this.template.removeEventListener(
      'resultactionregister',
      this.handleButtonRegister
    );
  }

  handleButtonRegister = (event) => {
    event.stopPropagation();
    const callbacks = event.detail;
    const ref = event.target;
    this.resultActionButtons.push({callbacks, ref});
  };

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
