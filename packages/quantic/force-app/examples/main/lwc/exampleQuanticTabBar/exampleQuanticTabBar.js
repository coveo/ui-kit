import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticTabBar extends LightningElement {
  @api engineId = 'quantic-tab-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Tab Bar';
  pageDescription = 'The QuanticTabBar component displays the Quantic Tabs in a responsive manner by showing a drop-down list that will display overflowing tabs on smaller screens.';

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
