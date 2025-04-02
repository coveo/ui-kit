import {api, LightningElement, track} from 'lwc';
// @ts-ignore
import templateDefaultSortOptions from './templates/templateDefaultSortOptions.html';
// @ts-ignore
import templateWithCustomSortOptions from './templates/templateWithCustomSortOptions.html';

export default class ExampleQuanticSort extends LightningElement {
  @api engineId = 'quantic-sort-engine';
  @track config = {};
  isConfigured = false;

  withCustomSortOptions = false;
  withInvalidCustomSortOptions = false;

  connectedCallback() {
    this.addEventListener(
      'addCustomSortOptions',
      this.handleAddCustomSortOptions
    );
  }

  disconnectedCallback() {
    this.removeEventListener(
      'addCustomSortOptions',
      this.handleAddCustomSortOptions
    );
  }

  handleAddCustomSortOptions = (event) => {
    this.withInvalidCustomSortOptions = event.detail.withInvalidOptions;
    this.withCustomSortOptions = true;
  };

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
  ];

  validCustomSortOptions = [
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

  invalidCustomSortOptions = [
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

  get customSortOptions() {
    return this.withInvalidCustomSortOptions
      ? this.invalidCustomSortOptions
      : this.validCustomSortOptions;
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }

  render() {
    if (this.withCustomSortOptions) {
      return templateWithCustomSortOptions;
    }
    return templateDefaultSortOptions;
  }
}
