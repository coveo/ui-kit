import {LightningElement, api} from 'lwc';

export default class ActionModal extends LightningElement {
  @api disabled;

  @api title;

  @api action;

  executeAction() {
    this.action();
  }
}
