import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticTab extends LightningElement {
  @api engineId = 'quantic-tab-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Tab';
  pageDescription =
    'The QuanticTab component allows the end user to view a subset of results.';
  options = [
    {
      attribute: 'name',
      label: 'Name',
      description:
        'A unique identifier for the tab. The value will be used as the originLevel2 when the tab is active.',
      defaultValue: 'Case',
    },
    {
      attribute: 'label',
      label: 'Label',
      description: 'The label to display on the tab.',
      defaultValue: 'Case',
    },
    {
      attribute: 'expression',
      label: 'Expression',
      description:
        'The constant query expression or filter that the Tab should add to any outgoing query.',
      defaultValue: '@objecttype=Case',
    },
    {
      attribute: 'isActive',
      label: 'Is active',
      description: 'Whether the tab should be active.',
      defaultValue: false,
    },
    {
      attribute: 'clearFiltersOnTabChange',
      label: 'Clear Filters on Tab Change',
      description: 'Whether to clear the filters when the active tab changes.',
      defaultValue: false,
    },
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
