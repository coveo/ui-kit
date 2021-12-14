import {LightningElement, api, track} from 'lwc';

export default class ExampleQuanticResultTemplate extends LightningElement {
  @api engineId = 'quantic-result-template-engine';
  @track config = {};

  pageTitle = 'Quantic Result Template';
  pageDescription = 'The QuanticResultTemplate component is used to construct result templates using predefined and formatted [slots]';
  options = [];

  handleTryItNow(evt) {
    this.config = evt.detail;
  }
}