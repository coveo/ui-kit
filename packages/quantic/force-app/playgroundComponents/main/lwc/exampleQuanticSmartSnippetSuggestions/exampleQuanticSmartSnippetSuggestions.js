import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticSmartSnippetSuggestions extends LightningElement {
  @api engineId = 'quantic-smart-snippet-suggestions';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Smart Snippet Suggestions';
  pageDescription =
    'The QuanticSmartSnippetSuggestions component displays additional queries for which a Coveo Smart Snippets model can provide relevant excerpts.';
  options = [
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight',
      defaultValue: 'search',
    },
  ];

  get notConfigured() {
    return !this.isConfigured;
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
