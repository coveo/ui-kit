import {LightningElement, track, api} from 'lwc';

export default class ExampleQuanticDocumentSuggestion extends LightningElement {
  @api caseAssistId = 'a4fb453a-b1f1-4054-9067-bef117586baa';

  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Document Suggestion';
  pageDescription =
    'The `QuanticDocumentSuggestion` component displays an accordion containing the document suggestions returned by Coveo Case Assist based on the values that the user has previously entred in the different fields.';

  options = [
    {
      attribute: 'engineId',
      label: 'Engine id',
      description: 'The id of the case assit engine associated.',
      defaultValue: 'case-assist-engine',
    },
    {
      attribute: 'searchEngineId',
      label: 'Search engine id',
      description: 'The id of the search engine associated.',
      defaultValue: 'search-engine',
    },
    {
      attribute: 'maxDocuments',
      label: 'Max documents',
      description:
        "The maximum number of document suggesions to display, it's a value between 1 and 5.",
      defaultValue: 5,
    },
  ];

  async handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
