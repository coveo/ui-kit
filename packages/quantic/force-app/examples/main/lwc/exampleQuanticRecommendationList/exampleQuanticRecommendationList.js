import {LightningElement, api, track} from 'lwc';

export default class ExampleQuanticRecommendationtList extends LightningElement {
  @api engineId = 'quantic-recommendation-list-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Recommendation List';
  pageDescription =
    'The `QuanticRecommendationList` component displays recommendations by applying one or more result templates in different layouts.';
  options = [
    {
      attribute: 'fieldsToInclude',
      label: 'Fields to include',
      description:
        'A list of fields to include in the query results, separated by commas.',
      defaultValue:
        'date,author,source,language,filetype,parents,sfknowledgearticleid',
    },
  ];
  expectedEvents = ['registerrecommendationtemplates'];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
