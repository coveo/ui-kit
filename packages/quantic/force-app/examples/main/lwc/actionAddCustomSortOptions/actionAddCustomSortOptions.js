import {api, LightningElement} from 'lwc';

export default class ActionAddCustomSortOptions extends LightningElement {
  @api disabled;
  @api withInvalidOptions = false;
  @api label;

  handleAddCustomSortOptions() {
    const addCustomSortOptionsEvent = new CustomEvent('addCustomSortOptions', {
      detail: {
        withInvalidOptions: this.withInvalidOptions,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(addCustomSortOptionsEvent);
  }
}
