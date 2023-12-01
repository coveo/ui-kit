import clear from '@salesforce/label/c.quantic_Clear';
import search from '@salesforce/label/c.quantic_Search';
import {keys} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import defaultSearchBoxInput from './templates/defaultSearchBoxInput.html';
// @ts-ignore
import expandableSearchBoxInput from './templates/expandableSearchBoxInput.html';

/** @typedef {import("coveo").SearchBox} SearchBox */
/** @typedef {import("coveo").StandaloneSearchBox} StandaloneSearchBox */
/** @typedef {import("c/quanticSearchBoxSuggestionsList").default} quanticSearchBoxSuggestionsList */

/**
 * @typedef Suggestion
 * @property {number} key
 * @property {string} value
 * @property {string} rawValue
 */

const CLASS_WITH_SUBMIT =
  'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right slds-input-has-fixed-addon';
const CLASS_WITHOUT_SUBMIT =
  'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right';

/**
 * The `QuanticSearchBoxInput` component renders the searchBox input.
 * @category Internal
 * @example
 * <c-quantic-search-box-input></c-quantic-search-box-input>
 */
export default class QuanticSearchBoxInput extends LightningElement {
  labels = {
    search,
    clear,
  };
  /**
   * Whether not to render a submit button.
   * @api
   * @type {boolean}
   * @defaultValue 'false'
   */
  @api withoutSubmitButton = false;
  /**
   * Whether to render the search box using a [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea) element.
   * The resulting component will expand to support multi-line queries.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api textarea = false;
  /**
   * The placeholder text to display in the search box input area.
   * @api
   * @type {string}
   * @defaultValue 'Search...'
   */
  @api placeholder = `${this.labels.search}`;
  /**
   * The search box engine (SearchBox | StandaloneSearchBox).
   * @api
   * @type {SearchBox | StandaloneSearchBox}
   */
  @api searchBoxEngine;
  /**
   * The query suggestions to display.
   * @api
   * @type {Suggestion[]}
   */
  @api suggestions = [];
  /**
   * The input value.
   * @api
   * @type {string}
   */
  @api value;
  /**
   * The blur function.
   * @api
   * @type {function}
   */
  @api blur() {
    this.input.blur();
  }

  connectedCallback() {
    this.addEventListener(
      'suggestionlistrender',
      this.handleSuggestionListEvent
    );
  }

  disconnectedCallback() {
    this.removeEventListener(
      'suggestionlistrender',
      this.handleSuggestionListEvent
    );
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

  handleEnter() {
    const selectedSuggestion = this.suggestionList?.getCurrentSelectedValue();
    if (this.suggestionsOpen && selectedSuggestion) {
      this.searchBoxEngine.selectSuggestion(selectedSuggestion.rawValue);
      this.input.blur();
    } else {
      this.searchBoxEngine.submit();
      this.input.blur();
    }
  }

  handleValueChange() {
    if (this.searchBoxEngine.state.value !== this.input.value) {
      this.searchBoxEngine.updateText(this.input.value);
    }
  }

  onSubmit(event) {
    event.stopPropagation();
    if (this.searchBoxEngine?.state?.value !== this.input.value) {
      this.searchBoxEngine.updateText(this.input.value);
    }
    this.searchBoxEngine.submit();
    this.input.blur();
  }

  handleKeyValues() {
    if (this.searchBoxEngine?.state?.value !== this.input.value) {
      this.suggestionList?.resetSelection();
      this.searchBoxEngine?.updateText(this.input.value);
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
    this.handleValueChange();
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
    this.searchBoxEngine.updateText(this.input.value);
    this.input.focus();
    if (this.textarea) {
      this.adjustTextAreaHeight();
    }
  }

  showSuggestions() {
    this.searchBoxEngine?.showSuggestions();
    this.combobox?.classList.add('slds-is-open');
    this.combobox?.setAttribute('aria-expanded', 'true');
  }

  hideSuggestions() {
    this.combobox?.classList.remove('slds-is-open');
    this.combobox?.setAttribute('aria-expanded', 'false');
    this.suggestionList?.resetSelection();
  }

  handleHighlightChange(event) {
    this.input.value = event.detail?.rawValue;
  }

  handleSuggestionSelection(event) {
    const textValue = event.detail;
    this.searchBoxEngine.selectSuggestion(textValue);
    this.blur();
  }

  handleSuggestionListEvent = (event) => {
    event.stopPropagation();
    const id = event.detail;
    this.input.setAttribute('aria-controls', id);
  };

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
    return this.combobox?.classList.contains('slds-is-open');
  }

  get isQueryEmpty() {
    return !this.input?.value?.length;
  }

  /**
   * @returns {HTMLElement}
   */
  get combobox() {
    return this.template.querySelector('.slds-combobox');
  }

  render() {
    return this?.textarea ? expandableSearchBoxInput : defaultSearchBoxInput;
  }
}
