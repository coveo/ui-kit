import {LightningElement, track} from 'lwc';
import {getCaseAssistId} from 'c/caseAssistUtils';

export default class ExampleQuanticDocumentSuggestion extends LightningElement {
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
    {
      attribute: 'fetchOnInit',
      label: 'Fetch on init',
      description:
        'Whether or not we want to fetch suggestions when initializing this component.',
      defaultValue: false,
    },
    {
      attribute: 'showQuickview',
      label: 'Show quickview',
      description:
        'Whether or not we want to disply the quick view for the document suggestions.',
      defaultValue: false,
    },
  ];

  async handleTryItNow(evt) {
    this.caseAssistId = await getCaseAssistId('Demo');
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
