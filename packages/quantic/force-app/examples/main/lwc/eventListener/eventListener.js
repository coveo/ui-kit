import {LightningElement, api, track} from 'lwc';

/** @typedef {{type: string, received: boolean, detail: any}} ExpectedEvent */

export default class EventListener extends LightningElement {
  /** @type {string[]} */
  @api expectedEvents = [];

  /** @type {ExpectedEvent[]} */
  @track events = [];

  connectedCallback() {
    this.expectedEvents.forEach((type) => {
      this.events.push({
        type,
        received: false,
        detail: {},
      });
      this.template.addEventListener(type, this.onEventReceived);
    });
  }

  disconnectedCallback() {
    this.expectedEvents.forEach((type) => {
      this.template.removeEventListener(type, this.onEventReceived);
    });
  }

  onEventReceived = (evt) => {
    const receivedEvent = this.events.find((event) => event.type === evt.type);
    receivedEvent.received = true;
    receivedEvent.detail = JSON.stringify(evt.detail);
  };

  get expectsEvents() {
    return !!this.expectedEvents.length;
  }
}
