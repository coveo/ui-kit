import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {getItemFromLocalStorage, setItemInLocalStorage} from 'c/quanticUtils';
import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import errorTemplate from './templates/errorTemplate.html';
// @ts-ignore
import searchBox from './templates/searchBox.html';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SearchBoxState} SearchBoxState */
/** @typedef {import("coveo").SearchBox} SearchBox */
/** @typedef {import("coveo").RecentQueriesList} RecentQueriesList */
/** @typedef {import('c/quanticSearchBoxSuggestionsList').default} quanticSearchBoxSuggestionsList */
/** @typedef {import("c/quanticSearchBoxInput").default} quanticSearchBoxInput */

/**
 * The `QuanticSearchBox` component creates a search box with built-in support for query suggestions.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-search-box engine-id={engineId} placeholder="Enter a query..." without-submit-button number-of-suggestions="8"></c-quantic-search-box>
 */
export default class QuanticSearchBox extends LightningElement {
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
   * The maximum number of suggestions and recent search queries to display.
   * @api
   * @type {number}
   * @defaultValue 7
   */
  @api numberOfSuggestions = 7;
  /**
   * Whether to render the search box using a [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea) element.
   * The resulting component will expand to support multi-line queries.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api textarea = false;
  /**
   * Whether to disable rendering the recent queries as suggestions.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api disableRecentQuerySuggestions = false;

  /** @type {SearchBoxState} */
  @track state;

  /** @type {SearchBox} */
  searchBox;
  /** @type {Function} */
  unsubscribe;
  /** @type {AnyHeadless} */
  headless;
  /** @type {Array} */
  suggestions = [];
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {RecentQueriesList} */
  recentQueriesList;
  /** @type {Array} */
  recentQueries;

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.searchBox = this.headless.buildSearchBox(engine, {
      options: {
        numberOfSuggestions: Number(this.numberOfSuggestions),
        highlightOptions: {
          notMatchDelimiters: {
            open: '<b>',
            close: '</b>',
          },
        },
      },
    });

    if (
      !this.disableRecentQuerySuggestions &&
      this.headless.buildRecentQueriesList
    ) {
      this.recentQueriesList = this.headless.buildRecentQueriesList(engine, {
        initialState: {
          queries: getItemFromLocalStorage(this.localStorageKey) ?? [],
        },
        options: {
          maxLength: 100,
        },
      });
      this.unsubscribeRecentQueriesList = this.recentQueriesList.subscribe(() =>
        this.updateRecentQueriesListState()
      );
    }
    this.unsubscribe = this.searchBox.subscribe(() => this.updateState());
  };

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.addEventListener(
      'quantic__inputvaluechange',
      this.handleInputValueChange
    );
    this.addEventListener('quantic__submitsearch', this.handleSubmit);
    this.addEventListener('quantic__showsuggestions', this.showSuggestion);
    this.addEventListener('quantic__selectsuggestion', this.selectSuggestion);
    if (!this.disableRecentQuerySuggestions) {
      this.addEventListener(
        'quantic__clearrecentqueries',
        this.clearRecentQueries
      );
    }
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.removeEventListener(
      'quantic__inputvaluechange',
      this.handleInputValueChange
    );
    this.removeEventListener('quantic__submitsearch', this.handleSubmit);
    this.removeEventListener('quantic__showsuggestions', this.showSuggestion);
    this.removeEventListener(
      'quantic__selectsuggestion',
      this.selectSuggestion
    );
    this.removeEventListener(
      'quantic__clearrecentqueries',
      this.clearRecentQueries
    );
  }

  updateState() {
    if (this.state?.value !== this.searchBox.state.value) {
      this.quanticSearchBoxInput.inputValue = this.searchBox.state.value;
    }
    this.state = this.searchBox?.state;
    this.suggestions =
      this.state?.suggestions?.map((suggestion, index) => ({
        key: index,
        rawValue: suggestion.rawValue,
        value: suggestion.highlightedValue,
      })) ?? [];
  }

  updateRecentQueriesListState() {
    if (this.recentQueriesList.state?.queries) {
      this.recentQueries = this.recentQueriesList.state.queries;
      setItemInLocalStorage(
        this.localStorageKey,
        this.recentQueriesList.state.queries
      );
    }
  }

  /**
   * Clears the recent queries.
   */
  clearRecentQueries = (event) => {
    event.stopPropagation();
    this.recentQueriesList.clear();
  };

  get localStorageKey() {
    return `${this.engineId}_quantic-recent-queries`;
  }

  /**
   * Updates the input value.
   */
  handleInputValueChange = (event) => {
    event.stopPropagation();
    const updatedValue = event.detail.newInputValue;
    const isSelectionReset = event.detail.resetSelection;
    if (this.searchBox?.state?.value !== updatedValue) {
      if (isSelectionReset) {
        this.quanticSearchBoxInput.resetSelection();
      }
      this.searchBox.updateText(updatedValue);
    }
  };

  /**
   * Submits a search.
   * @returns {void}
   */
  handleSubmit = (event) => {
    event.stopPropagation();
    this.searchBox?.submit();
  };

  /**
   * Shows the suggestions.
   * @returns {void}
   */
  showSuggestion = (event) => {
    event.stopPropagation();
    this.searchBox?.showSuggestions();
  };

  /**
   * Handles the selection of a suggestion.
   */
  selectSuggestion = (event) => {
    event.stopPropagation();
    const {value, isRecentQuery} = event.detail;
    if (isRecentQuery) {
      this.recentQueriesList.executeRecentQuery(
        this.recentQueries.indexOf(value)
      );
    } else {
      this.searchBox?.selectSuggestion(value);
    }
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
    return this.hasInitializationError ? errorTemplate : searchBox;
  }
}
