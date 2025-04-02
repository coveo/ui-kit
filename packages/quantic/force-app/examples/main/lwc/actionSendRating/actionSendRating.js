import {LightningElement} from 'lwc';

export default class ActionSendRating extends LightningElement {
  _id;
  renderedCallback() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this._id = this.template.host.dataset.id;
    }, 0);
  }
  handleSendRating() {
    const customEvent = new CustomEvent('quantic__rating', {
      detail: {
        id: this._id,
        score: 1,
      },
      bubbles: true,
    });
    this.dispatchEvent(customEvent);
  }
}
