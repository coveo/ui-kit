import {
  api,
  LightningElement,
  track
} from 'lwc';

export default class QuanticSearchBoxSuggestionsList extends LightningElement {
  /** @type {{key: number, value: string, rawValue: string}[]} */
  @api suggestions = [];
  /** @type {number} */
  @track selectionIndex = -1;

  renderedCallback() {
    if(this.selectionIndex > -1) {
      this.emitSuggestionHighlighted();
    }
  }

  @api selectionUp() {
    this.selectionIndex--;
    if(this.selectionIndex < 0) {
      this.selectionIndex = this.suggestions.length - 1;
    }
  }

  @api selectionDown() {
    this.selectionIndex++;
    if(this.selectionIndex >= this.suggestions.length) {
      this.selectionIndex = 0;
    }
  }

  @api getCurrentSelectedValue() {
    if(this.selectionIndex > -1) {
      return this.suggestions[this.selectionIndex];
    }
    return undefined;
  }

  @api resetSelection() {
    this.selectionIndex = -1;
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

  preventDefault(event) {
    event.preventDefault();
  }
}