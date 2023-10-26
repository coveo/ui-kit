import clear from '@salesforce/label/c.quantic_Clear';
import search from '@salesforce/label/c.quantic_Search';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {keys} from 'c/quanticUtils';
import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import defaultSearchBox from './templates/defaultSearchBox.html';
// @ts-ignore
import errorTemplate from './templates/errorTemplate.html';
// @ts-ignore
import expandableSearchBox from './templates/expandableSearchBox.html';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SearchBoxState} SearchBoxState */
/** @typedef {import("coveo").SearchBox} SearchBox */
/** @typedef {import('c/quanticSearchBoxSuggestionsList').default} quanticSearchBoxSuggestionsList */

const CLASS_WITH_SUBMIT =
  'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right slds-input-has-fixed-addon';
const CLASS_WITHOUT_SUBMIT =
  'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right';

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
      this.input.value = this.searchBox.state.value;
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
   * @returns {quanticSearchBoxSuggestionsList}
   */
  get suggestionList() {
    // @ts-ignore
    return this.template.querySelector('c-quantic-search-box-suggestions-list');
  }

  /**
   * @returns {HTMLInputElement|HTMLTextAreaElement}
   */
  get input() {
    return this.textarea
      ? this.template.querySelector('textarea')
      : this.template.querySelector('input');
  }

  /**
   * @returns {HTMLElement}
   */
  get combobox() {
    return this.template.querySelector('.slds-combobox');
  }

  get searchBoxContainerClass() {
    if (this.withoutSubmitButton) {
      this.input?.setAttribute('aria-labelledby', 'fixed-text-label');
      return CLASS_WITHOUT_SUBMIT;
    }
    this.input?.setAttribute(
      'aria-labelledby',
      'fixed-text-label fixed-text-addon-post'
    );
    return CLASS_WITH_SUBMIT;
  }

  get searchBoxInputClass() {
    return `slds-input searchbox__input ${
      this.withoutSubmitButton ? '' : 'searchbox__input-with-button'
    }`;
  }

  get suggestionsOpen() {
    return this.combobox.classList.contains('slds-is-open');
  }

  get isQueryEmpty() {
    return !this.input?.value?.length;
  }

  showSuggestions() {
    this.searchBox?.showSuggestions();
    this.combobox?.classList.add('slds-is-open');
    this.combobox?.setAttribute('aria-expanded', 'true');
  }

  hideSuggestions() {
    this.combobox?.classList.remove('slds-is-open');
    this.combobox?.setAttribute('aria-expanded', 'false');
    this.suggestionList?.resetSelection();
  }

  handleHighlightChange(event) {
    const suggestion = event.detail;
    this.input.value = suggestion.rawValue;
  }

  handleEnter() {
    const selectedSuggestion = this.suggestionList?.getCurrentSelectedValue();
    if (this.suggestionsOpen && selectedSuggestion) {
      this.searchBox.selectSuggestion(selectedSuggestion.rawValue);
      this.input.blur();
    } else {
      this.searchBox.submit();
      this.input.blur();
    }
  }

  onSubmit(event) {
    event.stopPropagation();
    if (this.searchBox.state.value !== this.input.value) {
      this.searchBox.updateText(this.input.value);
    }
    this.searchBox.submit();
    this.input.blur();
  }

  handleKeyValues() {
    if (this.searchBox?.state?.value !== this.input.value) {
      this.suggestionList?.resetSelection();
      this.searchBox.updateText(this.input.value);
    }
  }

  /**
   * Prevent default behavior of enter key, on textArea, to prevent skipping a line.
   * @param {KeyboardEvent} event
   */
  onKeydown(event) {
    if (event.key === keys.ENTER) {
      event.preventDefault();
    }
  }

  /**
   * @param {KeyboardEvent} event
   */
  onKeyup(event) {
    switch (event.key) {
      case keys.ENTER:
        this.handleEnter();
        break;
      case keys.ARROWUP:
        this.suggestionList?.selectionUp();
        break;
      case keys.ARROWDOWN:
        this.suggestionList?.selectionDown();
        break;
      default:
        this.handleKeyValues();
    }
  }

  onFocus() {
    this.showSuggestions();
    this.adjustTextAreaHeight();
  }

  onBlur() {
    this.hideSuggestions();
    this.collapseTextArea();
  }

  onTextAreaInput() {
    this.adjustTextAreaHeight();
  }

  adjustTextAreaHeight() {
    if (!this.textarea) {
      return;
    }
    this.input.value = this.input.value.replace(/\n/g, '');
    this.input.style.height = '';
    this.input.style.whiteSpace = 'pre-wrap';
    this.input.style.height = this.input.scrollHeight + 'px';
  }

  collapseTextArea() {
    if (!this.textarea) {
      return;
    }
    this.input.style.height = '';
    this.input.style.whiteSpace = 'nowrap';
  }

  clearInput() {
    this.input.value = '';
    this.searchBox.updateText(this.input.value);
    this.input.focus();
    if (this.textarea) {
      this.adjustTextAreaHeight();
    }
  }

  handleSuggestionSelection(event) {
    const textValue = event.detail;
    this.searchBox.selectSuggestion(textValue);
    this.input.blur();
  }

  handleSuggestionListEvent = (event) => {
    event.stopPropagation();
    const id = event.detail;
    this.input.setAttribute('aria-controls', id);
  };

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  render() {
    if (this.hasInitializationError) {
      return errorTemplate;
    }
    return this?.textarea ? expandableSearchBox : defaultSearchBox;
  }
}
