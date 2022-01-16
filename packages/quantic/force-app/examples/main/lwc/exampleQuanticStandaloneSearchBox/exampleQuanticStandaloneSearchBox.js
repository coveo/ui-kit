import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticStandaloneSearchBox extends LightningElement {
  @api engineId = 'quantic-standalone-search-box-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Standalone Search Box';
  pageDescription = 'The QuanticStandaloneSearchBox component creates a search box with built-in support for query suggestions.';
  options = [
    {
        attribute: 'placeholder',
        label: 'Placeholder',
        description: 'The placeholder text to display in the search box input area.',
        defaultValue: 'Search',
    },
    {
        attribute: 'withoutSubmitButton',
        label: 'Without submit button',
        description: 'Whether not to render a submit button.',
        defaultValue: false,
    },
    {
        attribute: 'numberOfSuggestions',
        label: 'Number of suggestions',
        description: 'The maximum number of suggestions to display.',
        defaultValue: 5,
    },
    {
        attribute: 'redirectUrl',
        label: 'Redirect url',
        description: 'The url of the search page to redirect to when a query is made.',
        defaultValue: '/global-search/%40uri',
    }
  ];

  get notConfigured() {
    return !this.isConfigured;
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
