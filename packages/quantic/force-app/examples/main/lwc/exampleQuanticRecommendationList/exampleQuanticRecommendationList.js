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
      attribute: 'recommendation',
      label: 'Recommendation',
      description:
        'The recommendation identifier used by the Coveo platform to retrieve recommended documents.',
      defaultValue: 'Recommendation',
    },
    {
      attribute: 'numberOfRecommendations',
      label: 'Number Of Recommendations',
      description: 'The total number of recommendations to fetch.',
      defaultValue: 10,
    },
    {
      attribute: 'recommendationsPerRow',
      label: 'Number Of Recommendations Per Row',
      description: 'The number of recommendations to display, per row.',
      defaultValue: 3,
    },
    {
      attribute: 'label',
      label: 'Label',
      description: 'The label of the component.',
    },
    {
      attribute: 'fieldsToInclude',
      label: 'Fields to include',
      description:
        'A list of fields to include in the query results, separated by commas.',
      defaultValue:
        'date,author,source,language,filetype,parents,sfknowledgearticleid',
    },
    {
      attribute: 'headingLevel',
      label: 'Heading Level',
      description: 'The Heading level to use for the heading label',
      defaultValue: 1,
    },
  ];
  expectedEvents = ['registerrecommendationtemplates'];

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
