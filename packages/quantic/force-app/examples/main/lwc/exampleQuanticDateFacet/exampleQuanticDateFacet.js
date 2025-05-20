import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticTimeframeFacet extends LightningElement {
  @api engineId = 'quantic-date-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Date Facet';
  pageDescription =
    'The QuanticDateFacet component displays facet values as date ranges.';
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
      defaultValue: 'Date',
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
