import {LightningElement, api, track} from 'lwc';

export default class ExampleQuanticResultList extends LightningElement {
  @api engineId = 'quantic-result-list-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Result List';
  pageDescription =
    'The QuanticResultList component is responsible for displaying query results by applying one or more result templates.';
  options = [
    {
      attribute: 'fieldsToInclude',
      label: 'Fields to include',
      description:
        'A list of fields to include in the query results, separated by commas.',
      defaultValue:
        'date,author,source,language,filetype,parents,sfknowledgearticleid',
    },
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
  ];
  expectedEvents = ['quantic__registerresulttemplates'];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
