import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticTimeframeFacet extends LightningElement {
  @api engineId = 'quantic-timeframe-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Timeframe Facet';
  pageDescription =
    'The QuanticTimeframeFacet component allows the end-user to filter results using a relative date interval.';
  options = [
    {
      attribute: 'field',
      label: 'Field',
      description: 'The name of the date field to display as a facet.',
      defaultValue: 'Date',
    },
    {
      attribute: 'label',
      label: 'Label',
      description: 'The label to use as the facet title.',
      defaultValue: 'Timeframe',
    },
    {
      attribute: 'withDatePicker',
      label: 'With date picker',
      description: 'Whether the date interval can be specified manually.',
      defaultValue: false,
    },
    {
      attribute: 'isCollapsed',
      label: 'Is collapsed',
      description: 'Whether the facet is initially collapsed.',
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
