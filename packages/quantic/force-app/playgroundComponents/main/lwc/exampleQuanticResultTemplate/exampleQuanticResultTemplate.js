import {LightningElement, track} from 'lwc';

export default class ExampleQuanticResultTemplate extends LightningElement {
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Result Template';
  pageDescription =
    'The QuanticResultTemplate component is used to construct result templates using predefined and formatted [slots]';
  options = [];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
