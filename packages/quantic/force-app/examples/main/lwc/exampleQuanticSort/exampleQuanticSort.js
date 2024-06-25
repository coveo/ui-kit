import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticSort extends LightningElement {
  @api engineId = 'quantic-sort-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Sort';
  pageDescription =
    'The QuanticSort component renders a dropdown that the end user can interact with to select the criterion to use when sorting query results.';
  options = [
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
    {
      attribute: 'customSortOptionsEnabled',
      label: 'Custom Sort Options Enabled',
      description: 'Enable the custom Sort options',
      defaultValue: false,
    },
    {
      attribute: 'invalidCustomSortOptionsEnabled',
      label: 'Invalid Custom Sort Options Enabled',
      description: 'Enable the invalid custom Sort options',
      defaultValue: false,
    },
  ];

  customSortOptionsArray = [
    {
      label: 'Date ascending',
      value: 'date ascending',
      criterion: {
        by: 'date',
        order: 'ascending',
      },
    },
    {
      label: 'Views Descending',
      value: '@ytviewcount descending',
      criterion: {
        by: 'field',
        field: 'ytviewcount',
        order: 'descending',
      },
    },
    {
      label: 'No Sort',
      value: 'nosort',
      criterion: {
        by: 'nosort',
      },
    },
  ];

  invalidCustomSortOptionsArray = [
    {
      label: undefined,
      value: 'date ascending',
      criterion: {
        by: 'nosort',
      },
    },
    {
      label: 'Date ascending',
      value: undefined,
      criterion: {
        by: 'date',
        order: 'ascending',
      },
    },
    {
      label: 'Views Descending',
      value: '@ytviewcount descending',
      criterion: {
        by: 'field',
        field: undefined,
        order: 'descending',
      },
    },
  ];

  get notConfigured() {
    return !this.isConfigured;
  }

  get customSortOptionsEnabled() {
    return this.config.customSortOptionsEnabled;
  }

  get customSortOptions() {
    return this.config.invalidCustomSortOptionsEnabled
      ? this.invalidCustomSortOptionsArray
      : this.customSortOptionsArray;
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
