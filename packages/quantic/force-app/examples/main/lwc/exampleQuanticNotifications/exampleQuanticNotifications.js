import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticNotifications extends LightningElement {
  @api engineId = 'quantic-notifications-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Notifications';
  pageDescription =
    'component is responsible for displaying notifications generated by the Coveo Search API.';
  options = [];

  get notConfigured() {
    return !this.isConfigured;
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
