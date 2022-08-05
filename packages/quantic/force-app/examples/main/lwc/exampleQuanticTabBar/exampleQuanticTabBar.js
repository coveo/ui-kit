import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticTabBar extends LightningElement {
  @api engineId = 'quantic-tab-bar-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Tab Bar';
  pageDescription =
    'The QuanticTabBar component displays the Quantic Tabs in a responsive manner. When tabs are wider than the available space, the tabs that cannot fit in the space are moved in the "More" drop-down list.';

  options = [
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
  ];
  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
