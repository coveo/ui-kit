import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticFacet extends LightningElement {
  @api engineId = 'quantic-category-facet-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Category Facet';
  pageDescription =
    'The Quantic Category Facet is a list of values for a certain field occurring in the results, displayed in a browsable, hierarchical fashion and ordered using a configurable criterion.';
  options = [
    {
      attribute: 'field',
      label: 'Field',
      description: 'The name of the field to display as a facet.',
      defaultValue: 'geographicalhierarchy',
    },
    {
      attribute: 'label',
      label: 'Label',
      description: 'The label to use as the facet title.',
      defaultValue: 'Country',
    },
    {
      attribute: 'basePath',
      label: 'Base path',
      description:
        'The base path shared by all facet values, separated by commas.',
      defaultValue: '',
    },
    {
      attribute: 'noFilterByBasePath',
      label: 'No Filter By Base Path',
      description:
        'Whether not to use the `basePath` as a filter for the results.',
      defaultValue: false,
    },
    {
      attribute: 'noFilterFacetCount',
      label: 'No Filter Facet Count',
      description:
        'Whether to include the parents of folded results when estimating the result count for each facet value.',
      defaultValue: false,
    },
    {
      attribute: 'delimitingCharacter',
      label: 'Delimiting Character',
      description:
        'The character that separates the values of the target multi-value field.',
      defaultValue: ';',
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
        'The sorting applied to the facet. Possible values are: alphanumeric, occurrences',
      defaultValue: 'occurrences',
    },
    {
      attribute: 'withSearch',
      label: 'With search',
      description:
        'Whether to remove the ability to search within facet values.',
      defaultValue: false,
    },
    {
      attribute: 'isCollapsed',
      label: 'Is Collapsed',
      description: 'Whether to collapse the facet.',
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
