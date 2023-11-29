import clear from '@salesforce/label/c.quantic_Clear';
import search from '@salesforce/label/c.quantic_Search';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import errorTemplate from './templates/errorTemplate.html';
// @ts-ignore
import searchBoxTemplate from './templates/searchBox.html';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SearchBoxState} SearchBoxState */
/** @typedef {import("coveo").SearchBox} SearchBox */
/** @typedef {import('c/quanticSearchBoxSuggestionsList').default} quanticSearchBoxSuggestionsList */

/**
 * The `QuanticSearchBox` component creates a search box with built-in support for query suggestions.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-search-box engine-id={engineId} placeholder="Enter a query..." without-submit-button number-of-suggestions="8"></c-quantic-search-box>
 */
export default class QuanticSearchBox extends LightningElement {
  labels = {
    search,
    clear,
  };

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
   * @defaultValue 'Search...'
   */
  @api placeholder = `${this.labels.search}`;
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
   * Whether to render the search box using a [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea) element.
   * The resulting component will expand to support multi-line queries.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api textarea = false;

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
    this.unsubscribe = this.searchBox.subscribe(() => this.updateState());
  };

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.addEventListener(
      'suggestionlistrender',
      this.handleSuggestionListEvent
    );
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.removeEventListener(
      'suggestionlistrender',
      this.handleSuggestionListEvent
    );
  }

  updateState() {
    if (this.state?.value !== this.searchBox.state.value) {
      this.quanticSearchBoxInput.value = this.searchBox.state.value;
    }
    this.state = this.searchBox.state;
    this.suggestions =
      this.state?.suggestions?.map((s, index) => ({
        key: index,
        rawValue: s.rawValue,
        value: s.highlightedValue,
      })) ?? [];
  }

  /**
   * @returns {HTMLInputElement|HTMLTextAreaElement}
   */
  get quanticSearchBoxInput() {
    return this.template.querySelector('c-quantic-search-box-input');
  }

  /**
   * @returns {string}
   */
  get value() {
    return this?.state?.value;
  }

  /**
   * @returns {Array}
   */
  get suggestionsArray() {
    return this?.state?.suggestions;
  }

  handleHighlightChange(event) {
    const suggestion = event.detail;
    this.quanticSearchBoxInput.value = suggestion.rawValue;
  }

  handleSuggestionSelection(event) {
    const textValue = event.detail;
    this.searchBox.selectSuggestion(textValue);
    this.quanticSearchBoxInput.blur();
  }

  handleSuggestionListEvent = (event) => {
    event.stopPropagation();
    const id = event.detail;
    this.quanticSearchBoxInput.setAttribute('aria-controls', id);
  };

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  render() {
    return !this.hasInitializationError ? searchBoxTemplate : errorTemplate;
  }
}
