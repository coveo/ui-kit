import clear from '@salesforce/label/c.quantic_Clear';
import search from '@salesforce/label/c.quantic_Search';
import {LightningElement, api} from 'lwc';
import {keys} from 'c/quanticUtils';
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

const CLASS_WITH_SUBMIT =
  'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right slds-input-has-fixed-addon';
const CLASS_WITHOUT_SUBMIT =
  'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right';

/**
 * The `QuanticSearchBoxInput` component renders the searchBox input.
 * @category Internal
 * @example
 * <c-quantic-search-box-input
 *  textarea={textarea}
    input={input}
    without-submit-button
    placeholder="Placeholder"
    value={value}
    suggestions={suggestions}>
 * </c-quantic-search-box-input>
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
  @api // not sure if still needed here
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

  /**
   * Sends the "inputValueChange" event.
   * @param {string} newInputValue
   */
  sendInputValueChangeEvent(newInputValue) {
    const inputValueChangeEvent = new CustomEvent('inputValueChange', {
      detail: {
        newInputValue,
      },
    });
    this.dispatchEvent(inputValueChangeEvent);
  }

  /**
   * Sends the "submitSearch" event.
   */
  sendSubmitSearchEvent() {
    this.dispatchEvent(new CustomEvent('submitSearch'));
  }

  /**
   * Sends the "showSuggestions" event.
   */
  sendShowSuggestionsEvent() {
    this.dispatchEvent(new CustomEvent('showSuggestions'));
  }

  /**
   * Sends the "selectSuggestion" event.
   * @param {Suggestion} selectedSuggestion
   */
  sendSelectSuggestionEvent(selectedSuggestion) {
    const selectSuggestionEvent = new CustomEvent('selectSuggestion', {
      detail: {
        selectedSuggestion,
      },
    });
    this.dispatchEvent(selectSuggestionEvent);
  }

  handleEnter() {
    const selectedSuggestion = this.suggestionList?.getCurrentSelectedValue();
    if (this.suggestionsOpen && selectedSuggestion) {
      // emit custom event about selecting a suggestion
      this.sendSelectSuggestionEvent(selectedSuggestion);
      this.input.blur();
    } else {
      // emit custom event to submit
      this.sendSubmitSearchEvent();
      this.input.blur();
    }
  }

  handleValueChange() {
    // emit custom event inputValueChange with the new value
    this.sendInputValueChangeEvent(this.input.value);
  }

  handleKeyValues() {
    // if (this.standaloneSearchBox?.state?.value !== this.input.value) {
    //   this.suggestionList?.resetSelection();
    //   this.standaloneSearchBox?.updateText(this.input.value);
    // }
    this.sendInputValueChangeEvent(this.input.value);
  }

  onSubmit(event) {
    event.stopPropagation();
    // emit custom event inputValueChange with the new value
    this.sendInputValueChangeEvent(this.input.value);
    // emit custom event submit
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
        this.suggestionList?.selectionUp();
        break;
      case keys.ARROWDOWN:
        this.suggestionList?.selectionDown();
        break;
      default:
        // this.handleKeyValues(); // see note on handleValueChange
        this.handleValueChange(); // for now
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
    // emit custom event inputValueChange
    this.sendInputValueChangeEvent(this.input.value);
    this.input.focus();
    if (this.textarea) {
      this.adjustTextAreaHeight();
    }
  }

  showSuggestions() {
    // emit custom event to showSuggestions
    this.sendShowSuggestionsEvent();
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
    // this.searchBoxEngine.selectSuggestion(textValue);
    // emit custom event about selecting a suggestion
    this.sendSelectSuggestionEvent(textValue);
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
