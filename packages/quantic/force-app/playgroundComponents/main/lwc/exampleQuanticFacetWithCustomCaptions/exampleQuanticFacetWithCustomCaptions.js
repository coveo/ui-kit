import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticFacetWithCaptions extends LightningElement {
  @api engineId = 'quantic-facet-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Facet with custom captions';
  pageDescription =
    'The Quantic Facet allows users to refine search results by selecting one or more field values. This specific example uses the Quantic Facet Caption to override the captions displayed to users.';
  options = [
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
    {
      attribute: 'value',
      label: 'Value',
      description: 'The facet value to override',
      defaultValue: 'Case',
    },
    {
      attribute: 'caption',
      label: 'Caption',
      description: 'The custom caption to use.',
      defaultValue: 'My custom caption',
    },
  ];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
