// @ts-ignore
import {getCaseAssistId} from 'c/caseAssistUtils';
import {LightningElement, track} from 'lwc';

export default class ExampleQuanticDocumentSuggestion extends LightningElement {
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Document Suggestion';
  pageDescription =
    'The `QuanticDocumentSuggestion` component displays an accordion containing the document suggestions returned by Coveo Case Assist based on the values that the user has previously entered in the different fields.';

  options = [
    {
      attribute: 'engineId',
      label: 'Engine id',
      description: 'The id of the case assist engine associated.',
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
        'The maximum number of document suggestions to display. The value must be between 1 and 5, inclusively.',
      defaultValue: 3,
    },
    {
      attribute: 'fetchOnInit',
      label: 'Fetch on init',
      description:
        'Whether or not we want to fetch suggestions when initializing this component.',
      defaultValue: false,
    },
    {
      attribute: 'withoutQuickview',
      label: 'Hide quickview',
      description:
        'Whether or not we want to hide the quick view for the document suggestions.',
      defaultValue: false,
    },
    {
      attribute: 'numberOfAutoOpenedDocuments',
      label: 'Number of automatically opened documents',
      description:
        'The number of automatically opened document suggestions when fetching suggestions.',
      defaultValue: 1,
    },
  ];

  async handleTryItNow(evt) {
    this.caseAssistId = await getCaseAssistId('Demo');
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
