import {api, LightningElement} from 'lwc';

export default class ActionAddCustomSortOptions extends LightningElement {
  @api engineId;
  @api disabled;
  @api withInvalidOptions = false;
  @api label;

  handleAddCustomSortOptions() {
    const eventName = this.withInvalidOptions
      ? 'addInvalidCustomSortOptions'
      : 'addCustomSortOptions';
    const addCustomSortOptionsEvent = new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(addCustomSortOptionsEvent);
  }
}
