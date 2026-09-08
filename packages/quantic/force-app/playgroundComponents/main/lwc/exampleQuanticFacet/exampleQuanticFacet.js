import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticFacet extends LightningElement {
  @api engineId = 'quantic-facet-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Facet';
  pageDescription =
    'The Quantic Facet allows users to refine search results by selecting one or more field values.';
  options = [
    {
      attribute: 'field',
      label: 'Field',
      description: 'The name of the field to display as a facet.',
      defaultValue: 'objecttype',
    },
    {
      attribute: 'label',
      label: 'Label',
      description: 'The label to use as the facet title.',
      defaultValue: 'Type',
    },
    {
      attribute: 'numberOfValues',
      label: 'Number of values',
      description: 'The number of values displayed by the facet.',
      defaultValue: 8,
    },
    {
      attribute: 'sortCriteria',
      label: 'Sort criteria',
      description:
        'The sorting applied to the facet. Possible values are: automatic, score, alphanumeric, occurrences',
      defaultValue: 'automatic',
    },
    {
      attribute: 'noSearch',
      label: 'No search',
      description:
        'Whether to remove the ability to search within facet values.',
      defaultValue: false,
    },
    {
      attribute: 'isCollapsed',
      label: 'Is collapsed',
      description: 'Whether to collapse the facet.',
      defaultValue: false,
    },
    {
      attribute: 'displayValuesAs',
      label: 'Display values as',
      description:
        'Whether to display the facet values in "checkbox" mode (multiple selection) or "link" mode (single selection).',
      defaultValue: 'checkbox',
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
