import {LightningElement, track} from 'lwc';

const DEFAULT_ENGINE_ID = 'quantic-search-box-engine';
const RECENT_QUERIES_STORAGE_KEY_SUFFIX = '_quantic-recent-queries';

export default class ExampleQuanticSearchBox extends LightningElement {
  @track config = {
    engineId: DEFAULT_ENGINE_ID,
  };
  isConfigured = false;

  pageTitle = 'Quantic Search Box';
  pageDescription =
    'The `QuanticSearchBox` component creates a search box with built-in support for query suggestions and query history.';
  options = [
    {
      attribute: 'engineId',
      label: 'Engine id',
      description: 'The ID of the engine instance the component registers to.',
      defaultValue: DEFAULT_ENGINE_ID,
    },
    {
      attribute: 'useCase',
      label: 'Use Case',
      description:
        'Define which use case to test. Possible values are: search, insight.',
      defaultValue: 'search',
    },
    {
      attribute: 'placeholder',
      label: 'Placeholder',
      description:
        'The placeholder text to display in the search box input area.',
    },
    {
      attribute: 'withoutSubmitButton',
      label: 'Without submit button',
      description: 'Whether not to render a submit button.',
    },
    {
      attribute: 'textarea',
      label: 'Textarea',
      description: 'Whether to render the search box using a textarea.',
      defaultValue: false,
    },
    {
      attribute: 'numberOfSuggestions',
      label: 'Number of suggestions',
      description: ' The maximum number of suggestions to display.',
      defaultValue: 7,
    },
    {
      attribute: 'disableRecentQueries',
      label: 'Disable recent query suggestions',
      description:
        'Whether to disable rendering the recent queries as suggestions.',
      defaultValue: false,
    },
  ];

  get notConfigured() {
    return !this.isConfigured;
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }

  get recentQueriesStorageKey() {
    return `${this.config.engineId}${RECENT_QUERIES_STORAGE_KEY_SUFFIX}`;
  }
}
