import {LightningElement, api,track} from 'lwc';

/**
 * @typedef Suggestion
 * @property {number} key
 * @property {string} value
 * @property {string} rawValue
 */

/**
 * The `QuanticSearchBoxSuggestionsList` is used internally by search box components to display the query suggestions in an omnibox.
 * @fires CustomEvent#highlightchange
 * @fires CustomEvent#suggestionselected
 * @category Search
 * @example
 * <c-quantic-search-box-suggestions-list suggestions={suggestions} onhighlightchange={handleHighlightChange} onsuggestionselected={handleSuggestionSelection}></c-quantic-search-box-suggestions-list>
 */
export default class QuanticSearchBoxSuggestionsList extends LightningElement {
  /**
   * The query suggestions to display.
   * @api
   * @type {Suggestion[]}
   */
  @api suggestions = [];

  /**
   * Move highlighted selection up.
   */
  @api
  selectionUp() {
    this.selectionIndex--;
    if(this.selectionIndex < 0) {
      this.selectionIndex = this.suggestions.length - 1;
    }
  }

  /**
   * Move highlighted selection down.
   */
  @api 
  selectionDown() {
    this.selectionIndex++;
    if(this.selectionIndex >= this.suggestions.length) {
      this.selectionIndex = 0;
    }
  }

  /**
   * Return the currently selected suggestion.
   * @returns {Suggestion}
   */
  @api 
  getCurrentSelectedValue() {
    if(this.selectionIndex > -1) {
      return this.suggestions[this.selectionIndex];
    }
    return undefined;
  }

  /**
   * Reset the current selection.
   */
  @api 
  resetSelection() {
    this.selectionIndex = -1;
  }
  
  /** @type {number} */
  @track selectionIndex = -1;

  renderedCallback() {
    if(this.selectionIndex > -1) {
      this.emitSuggestionHighlighted();
    }
  }

  get suggestionsToRender() {
    return this.suggestions.map((s, i) => ({
      ...s,
      isSelected: this.selectionIndex === i
    }));
  }

  emitSuggestionHighlighted() {
    const highlightChangeEvent = new CustomEvent('highlightchange', {
      detail: this.suggestions[this.selectionIndex]
    });
    this.dispatchEvent(highlightChangeEvent);
  }

  handleSuggestionSelection(event) {
    const liElement = event.target.closest('li.slds-listbox__item');
    const textValue = liElement.dataset.rawvalue;

    const suggestionSelectedEvent = new CustomEvent('suggestionselected', {
      detail: textValue
    });
    this.dispatchEvent(suggestionSelectedEvent);
  }

  handleSuggestionHover() {
    this.resetSelection();
  }

  preventDefault(event) {
    event.preventDefault();
  }
}