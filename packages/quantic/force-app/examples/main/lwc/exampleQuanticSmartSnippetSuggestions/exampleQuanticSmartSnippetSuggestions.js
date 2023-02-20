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
      attribute: 'maximumNumberOfSuggestions',
      label: 'Maximum number of suggestions',
      description:
        'The number of suggestions to display in the component. Must be a value between 1 and 4.',
      defaultValue: 4,
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
