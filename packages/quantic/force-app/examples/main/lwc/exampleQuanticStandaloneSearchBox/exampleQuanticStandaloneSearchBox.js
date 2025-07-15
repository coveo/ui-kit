import {api, LightningElement, track} from 'lwc';

export default class ExampleQuanticStandaloneSearchBox extends LightningElement {
  @api engineId = 'quantic-standalone-search-box-engine';
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Standalone Search Box';
  pageDescription =
    'The QuanticStandaloneSearchBox component creates a search box with built-in support for query suggestions.';
  options = [
    {
      attribute: 'placeholder',
      label: 'Placeholder',
      description:
        'The placeholder text to display in the search box input area.',
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
      description:
        'The URL of the search page to redirect to when a query is performed.',
      defaultValue: '/global-search/%40uri',
    },
    {
      attribute: 'searchHub',
      label: 'Search Hub',
      description:
        'The search hub to use for this Standalone Search Box. This value does not affect the target search page after redirection. Setting the searchhub to be used on the target search page should be done on said search page component.',
      defaultValue: 'default',
    },
    {
      attribute: 'pipeline',
      label: 'Pipeline',
      description:
        'The query pipeline to use for this Standalone Search Box. This value does not affect the target search page after redirection. Setting the pipeline to be used on the target search page should be done on said search page component.',
      defaultValue: undefined,
    },
    {
      attribute: 'textarea',
      label: 'Textarea',
      description:
        'Render the searchbox as an auto-expandable textarea instead of a HTMLInput',
      defaultValue: false,
    },
  ];

  get notConfigured() {
    return !this.isConfigured;
  }

  get standaloneSearchboxStorageKey() {
    return 'coveo-standalone-search-box';
  }

  handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}
