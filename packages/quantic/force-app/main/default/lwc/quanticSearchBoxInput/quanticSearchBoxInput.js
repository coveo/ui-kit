import clear from '@salesforce/label/c.quantic_Clear';
import search from '@salesforce/label/c.quantic_Search';
import {keys} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import defaultSearchBoxInput from './templates/defaultSearchBoxInput.html';
// @ts-ignore
import expandableSearchBoxInput from './templates/expandableSearchBoxInput.html';

/** @typedef {import("c/quanticSearchBoxSuggestionsList").default} quanticSearchBoxSuggestionsList */

/**
 * @typedef Suggestion
 * @property {number} key
 * @property {string} value
 * @property {string} rawValue
 */

/**
 * The `QuanticSearchBoxInput` component renders the searchBox input.
 * @fires CustomEvent#quantic__inputvaluechange
 * @fires CustomEvent#quantic__submitsearch
 * @fires CustomEvent#quantic__showsuggestions
 * @fires CustomEvent#quantic__selectsuggestion
 * @category Internal
 * @example
 * <c-quantic-search-box-input
 *  textarea={textarea}
    without-submit-button
    placeholder="Placeholder"
    suggestions={suggestions}>
 * </c-quantic-search-box-input>
 */
export default class QuanticSearchBoxInput extends LightningElement {
  labels = {
    search,
    clear,
  };
  /**
   * Indicates whether or not to display a submit button.
   * @api
   * @type {boolean}
   * @defaultValue 'false'
   */
  @api withoutSubmitButton = false;
  /**
   * Indicates whether to render the search box using a [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea) element.
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
  @api placeholder = this.labels.search;
  /**
   * The query suggestions to display.
   * @api
   * @type {Suggestion[]}
   */
  @api suggestions = [];
  /**
   * Returns and set the input value.
   * @api
   * @type {string}
   */
  @api
  get inputValue() {
    return this.input.value;
  }
  set inputValue(newValue) {
    this.input.value = newValue;
  }
  /**
   * The blur function.
   * @api
   * @type {VoidFunction}
   */
  @api blur() {
    this.input.blur();
  }
  /**
   * The reset selection function.
   * @api
   * @type {VoidFunction}
   */
  @api resetSelection() {
    this.suggestionListElement?.resetSelection();
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
  get suggestionListElement() {
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
   * Sends the "quantic__inputValueChange" event.
   * @param {string} newInputValue
   * @param {boolean} resetSelection
   */
  sendInputValueChangeEvent(newInputValue, resetSelection) {
    const inputValueChangeEvent = new CustomEvent('quantic__inputvaluechange', {
      detail: {
        newInputValue,
        resetSelection,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(inputValueChangeEvent);
  }

  /**
   * Sends the "quantic__submitSearch" event.
   */
  sendSubmitSearchEvent() {
    this.dispatchEvent(
      new CustomEvent('quantic__submitsearch', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Sends the "quantic__showSuggestions" event.
   */
  sendShowSuggestionsEvent() {
    this.dispatchEvent(
      new CustomEvent('quantic__showsuggestions', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Sends the "quantic__selectSuggestion" event.
   * @param {string} selectedSuggestion
   */
  sendSelectSuggestionEvent(selectedSuggestion) {
    const selectSuggestionEvent = new CustomEvent('quantic__selectsuggestion', {
      detail: {
        selectedSuggestion,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(selectSuggestionEvent);
  }

  handleEnter() {
    const selectedSuggestion =
      this.suggestionListElement?.getCurrentSelectedValue();
    if (this.areSuggestionsOpen && selectedSuggestion) {
      this.sendSelectSuggestionEvent(selectedSuggestion.rawValue);
    } else {
      this.sendSubmitSearchEvent();
    }
    this.input.blur();
  }

  handleValueChange() {
    this.sendInputValueChangeEvent(this.input.value, false);
  }

  handleKeyValues() {
    // Reset selection set to true for key pressed other than ARROW keys and ENTER.
    this.sendInputValueChangeEvent(this.input.value, true);
  }

  onSubmit(event) {
    event.stopPropagation();
    this.sendInputValueChangeEvent(this.input.value, false);
    this.sendSubmitSearchEvent();
    this.input.blur();
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
        this.suggestionListElement?.selectionUp();
        break;
      case keys.ARROWDOWN:
        this.suggestionListElement?.selectionDown();
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
    this.sendInputValueChangeEvent(this.input.value, false);
    this.input.focus();
    if (this.textarea) {
      this.adjustTextAreaHeight();
    }
  }

  showSuggestions() {
    this.sendShowSuggestionsEvent();
    this.combobox?.classList.add('slds-is-open');
    this.combobox?.setAttribute('aria-expanded', 'true');
  }

  hideSuggestions() {
    this.combobox?.classList.remove('slds-is-open');
    this.combobox?.setAttribute('aria-expanded', 'false');
    this.suggestionListElement?.resetSelection();
  }

  handleHighlightChange(event) {
    this.input.value = event.detail?.rawValue;
  }

  handleSuggestionSelection(event) {
    const textValue = event.detail;
    this.sendSelectSuggestionEvent(textValue);
    this.blur();
  }

  handleSuggestionListEvent = (event) => {
    event.stopPropagation();
    const id = event.detail;
    this.input.setAttribute('aria-controls', id);
  };

  get searchBoxContainerClass() {
    return `slds-combobox__form-element slds-input-has-icon slds-grid ${
      this.withoutSubmitButton
        ? 'slds-input-has-icon_left-right'
        : 'slds-input-has-icon_right slds-input-has-fixed-addon'
    }`;
  }

  get searchBoxInputClass() {
    return `slds-input searchbox__input ${
      this.withoutSubmitButton ? '' : 'searchbox__input-with-button'
    }`;
  }

  get areSuggestionsOpen() {
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
