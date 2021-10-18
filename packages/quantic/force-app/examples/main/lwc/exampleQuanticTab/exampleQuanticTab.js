import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticTab extends LightningElement {
  @api engineId = 'quantic-tab-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Tab';
  pageDescription = 'The QuanticTab component allows the end user to view a subset of results.';
  options = [
    {
      attribute: 'label',
      label: 'Label',
      description: 'The non-localized label for the tab.',
      defaultValue: 'Case'
    },
    {
      attribute: 'expression',
      label: 'Expression',
      description: 'The constant query expression or filter that the Tab should add to any outgoing query.',
      defaultValue: '@objecttype=Case'
    },
    {
      attribute: 'isActive',
      label: 'Is active',
      description: 'Whether the tab should be active.',
      defaultValue: false
    }
  ];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
