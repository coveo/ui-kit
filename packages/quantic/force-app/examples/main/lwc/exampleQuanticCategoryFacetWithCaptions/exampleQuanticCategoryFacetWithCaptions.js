import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticFacet extends LightningElement {
  @api engineId = 'quantic-category-facet-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Category Facet with captions';
  pageDescription =
    'The Quantic Category Facet is a list of values for a certain field occurring in the results, displayed in a browsable, hierarchical fashion and ordered using a configurable criterion. This specific example uses the Quantic Facet Caption to override the captions displayed to users.';
  options = [
    {
      attribute: 'field',
      label: 'Field',
      description: 'The name of the field to display as a facet.',
      defaultValue: 'geographicalhierarchy',
    },
    {
      attribute: 'value',
      label: 'Value',
      description: 'The facet value to override.',
      defaultValue: 'test',
    },
    {
      attribute: 'caption',
      label: 'Caption',
      description: 'The caption to override.',
      defaultValue: 'My custom test caption',
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
