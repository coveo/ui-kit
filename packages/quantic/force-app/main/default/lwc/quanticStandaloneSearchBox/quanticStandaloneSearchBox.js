import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBindings,
  destroyEngine,
} from 'c/quanticHeadlessLoader';
import {STANDALONE_SEARCH_BOX_STORAGE_KEY} from 'c/quanticUtils';
import {CurrentPageReference, NavigationMixin} from 'lightning/navigation';
import {LightningElement, api, track, wire} from 'lwc';
// @ts-ignore
import errorTemplate from './templates/errorTemplate.html';
// @ts-ignore
import standaloneSearchBox from './templates/standaloneSearchBox.html';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").StandaloneSearchBoxState} StandaloneSearchBoxState */
/** @typedef {import("coveo").StandaloneSearchBox} StandaloneSearchBox */
/** @typedef {import("c/quanticSearchBoxSuggestionsList").default} quanticSearchBoxSuggestionsList */
/** @typedef {import("c/quanticSearchBoxInput").default} quanticSearchBoxInput */
/** @typedef {{key: number, value: string}} Suggestion */

/**
 * The `QuanticStandaloneSearchBox` component creates a search box with built-in support for query suggestions.
 * See [Use a Standalone Search Box](https://docs.coveo.com/en/quantic/latest/usage/ssb-usage/).
 * @category Search
 * @example
 * <c-quantic-standalone-search-box engine-id={engineId} placeholder="Enter a query..." without-submit-button number-of-suggestions="8" redirect-url="/my-search-page/%40uri" search-hub="myhub" pipeline="mypipeline"></c-quantic-standalone-search-box>
 */
export default class QuanticStandaloneSearchBox extends NavigationMixin(
  LightningElement
) {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The placeholder text to display in the search box input area.
   * @api
   * @type {string}
   */
  @api placeholder = null;
  /**
   * Whether not to render a submit button.
   * @api
   * @type {boolean}
   * @defaultValue 'false'
   */
  @api withoutSubmitButton = false;
  /**
   * The maximum number of suggestions to display.
   * @api
   * @type {number}
   * @defaultValue 5
   */
  @api numberOfSuggestions = 5;
  /**
   * Whether to keep all active query filters when the end user submits a new query from the standalone search box.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api keepFiltersOnSearch = false;
  /**
   * The url of the search page to redirect to when a query is made.
   * The target search page should contain a `QuanticSearchInterface` with the same engine ID as the one specified for this component.
   * @api
   * @type {string}
   * @defaultValue '/global-search/%40uri'
   */
  @api redirectUrl = '/global-search/%40uri';
  /**
   * The [search hub](https://docs.coveo.com/en/1342/) to use for this Standalone Search Box.
   * This value does not affect the target search page after redirection.
   * Setting the searchhub to be used on the target search page should be done on said search page component.
   * @api
   * @type {string}
   * @defaultValue 'default'
   */
  @api searchHub = 'default';
  /**
   * The [query pipeline](https://docs.coveo.com/en/180/) to use for this Standalone Search Box.
   * This value does not affect the target search page after redirection.
   * Setting the pipeline to be used on the target search page should be done on said search page component.
   * @api
   * @type {string}
   * @defaultValue `undefined`
   */
  @api pipeline;
  /**
   * Whether to render the search box using a [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea) element.
   * The resulting component will expand to support multi-line queries.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api textarea = false;

  /** @type {boolean} */
  @track isStandalone = true;
  /** @type {StandaloneSearchBoxState} */
  @track state = {
    analytics: {
      cause: '',
      metadata: null,
    },
    searchBoxId: '',
    redirectTo: null,
    suggestions: [],
    value: '',
    isLoading: false,
    isLoadingSuggestions: false,
  };

  /** @type {StandaloneSearchBox} */
  standaloneSearchBox;
  /** @type {Function} */
  unsubscribe;
  /** @type {boolean} */
  isInitialized = false;
  /** @type {Suggestion[]} */
  suggestions = [];
  /** @type {boolean} */
  hasInitializationError = false;

  /** @type {string} */
  get standaloneEngineId() {
    return `${this.engineId}_standalone`;
  }

  connectedCallback() {
    registerComponentForInit(this, this.standaloneEngineId);

    this.addEventListener(
      'quantic__inputvaluechange',
      this.handleInputValueChange
    );
    this.addEventListener('quantic__submitsearch', this.handleSubmit);
    this.addEventListener('quantic__showsuggestions', this.showSuggestions);
    this.addEventListener('quantic__selectsuggestion', this.selectSuggestion);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.standaloneEngineId, this.initialize);
    if (
      !this.isInitialized &&
      !!this.standaloneSearchBox &&
      !!this.quanticSearchBoxInput
    ) {
      // The is-initialized attribute is set to true for E2E tests
      this.quanticSearchBoxInput.setAttribute('is-initialized', 'true');
      this.isInitialized = true;
    }
  }

  @wire(CurrentPageReference)
  handlePageChange() {
    this.isStandalone = !window.location.href.includes(this.redirectUrl);
    if (!this.isStandalone && this.standaloneEngine) {
      this.initialize(this.standaloneEngine);
    }
    if (this.isStandalone) {
      destroyEngine(this.engineId);
    }
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.standaloneSearchBox = CoveoHeadless.buildStandaloneSearchBox(engine, {
      options: {
        numberOfSuggestions: Number(this.numberOfSuggestions),
        highlightOptions: {
          notMatchDelimiters: {
            open: '<b>',
            close: '</b>',
          },
        },
        clearFilters: !this.keepFiltersOnSearch,
        redirectionUrl: 'http://placeholder.com',
      },
    });
    this.standaloneEngine = engine;
    this.unsubscribe = this.standaloneSearchBox.subscribe(() =>
      this.updateStandaloneState()
    );
  };

  disconnectedCallback() {
    this.unsubscribe?.();

    this.removeEventListener(
      'quantic__inputvaluechange',
      this.handleInputValueChange
    );
    this.removeEventListener('quantic__submitsearch', this.handleSubmit);
    this.removeEventListener('quantic__showsuggestions', this.showSuggestions);
    this.removeEventListener(
      'quantic__selectsuggestion',
      this.selectSuggestion
    );
  }

  get searchBoxValue() {
    return this.standaloneSearchBox?.state.value || '';
  }

  updateStandaloneState() {
    this.state = this.standaloneSearchBox?.state;
    this.suggestions =
      this.state?.suggestions?.map((s, index) => ({
        key: index,
        rawValue: s.rawValue,
        value: s.highlightedValue,
      })) ?? [];

    // Check for redirect
    const {redirectTo, value, analytics} = this.standaloneSearchBox.state;
    if (!redirectTo) {
      return;
    }

    localStorage.setItem(
      STANDALONE_SEARCH_BOX_STORAGE_KEY,
      JSON.stringify({
        value,
        analytics,
      })
    );
    this.navigateToSearchPage();
  }

  resetStandaloneSearchboxState() {
    const engine = getHeadlessBindings(this.standaloneEngineId)?.engine;
    if (!engine) {
      return;
    }
    const {updateQuery} = CoveoHeadless.loadQueryActions(engine);

    engine.dispatch(updateQuery({q: ''}));
  }

  navigateToSearchPage() {
    const value = this.standaloneSearchBox.state.value;
    this.resetStandaloneSearchboxState();
    this[NavigationMixin.Navigate](
      {
        type: 'standard__webPage',
        attributes: {
          url: `${this.redirectUrl}${
            value ? `#q=${encodeURIComponent(value)}` : ''
          }`,
        },
      },
      false
    );
  }

  /**
   * Updates the input value.
   */
  handleInputValueChange = (event) => {
    event.stopPropagation();
    const newValue = event.detail.value;
    if (this.standaloneSearchBox?.state?.value !== newValue) {
      this.standaloneSearchBox.updateText(newValue);
    }
  };

  /**
   * Submits a search.
   * @returns {void}
   */
  handleSubmit = (event) => {
    event.stopPropagation();
    this.standaloneSearchBox?.submit();
  };

  /**
   * Shows the suggestions.
   * @returns {void}
   */
  showSuggestions = (event) => {
    event.stopPropagation();
    this.standaloneSearchBox?.showSuggestions();
  };

  /**
   * Handles the selection of a suggestion.
   */
  selectSuggestion = (event) => {
    event.stopPropagation();
    const {value} = event.detail.selectedSuggestion;
    this.standaloneSearchBox?.selectSuggestion(value);
  };

  /**
   * @return {quanticSearchBoxInput}
   */
  get quanticSearchBoxInput() {
    // @ts-ignore
    return this.template.querySelector('c-quantic-search-box-input');
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  render() {
    return this.hasInitializationError ? errorTemplate : standaloneSearchBox;
  }
}
