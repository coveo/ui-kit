import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticAriaLive extends LightningElement {
  @api engineId = 'quantic-aria-live-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Aria Live';
  pageDescription =
    'The Quantic Aria Live announces context changes to assistive software.';
  options = [];

  get notConfigured() {
    return !this.isConfigured;
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
