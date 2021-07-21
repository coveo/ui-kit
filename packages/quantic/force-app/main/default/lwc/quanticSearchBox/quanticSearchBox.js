import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';

import search from '@salesforce/label/c.quantic_Search';

const ENTER = 13;
const ARROWUP = 38;
const ARROWDOWN = 40;

export default class QuanticSearchBox extends LightningElement {
  /** @type {import("coveo").SearchBoxState} */
  @track state = {
    // @ts-ignore
    redirectTo: '',
    suggestions: [],
    value: '',
  };
  /** @type {any} */
  get suggestions() {
    return this.state.suggestions.map((s, index) => ({
      key: index,
      value: s.highlightedValue,
    }));
  }
  /** @type {string} */
  @api engineId;
  /** @type {string} */
  @api placeholder = `${search}...`;
  /** @type {boolean} */
  @api withoutSubmitButton = false;
  /** @type {number} */
  @api numberOfSuggestions = 5;


  /** @type {string} */
  searchBoxContainerClass;
  /** @type {import("coveo").SearchBox} */
  searchBox;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  /** @type {number} */
  selectionIndex = -1;
  /** @type {HTMLInputElement} */
  input;
  /** @type {HTMLElement} */
  combobox;
  /** @type {HTMLButtonElement} */
  clearButton;
  /** @type {() => void} */
  resetSelectionIndex = () => {
    this.selectionIndex = -1;
  };
  /** @type {() => boolean} */
  areSuggestionsShown = () =>
    this.template
      .querySelector('.slds-combobox')
      .classList.contains('slds-is-open');
  /** @type {() => NodeListOf<HTMLElement>} */
  getSuggestionElements = () =>
    this.template.querySelectorAll('.slds-listbox__option');

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.searchBox = CoveoHeadless.buildSearchBox(engine, {
      options: {
        numberOfSuggestions: this.numberOfSuggestions,
        highlightOptions: {
          notMatchDelimiters: {
            open: '<b>',
            close: '</b>',
          },
        },
      },
    });
    this.unsubscribe = this.searchBox.subscribe(() => this.updateState());
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
    if (!this.input) {
      this.input = this.template.querySelector('input');
    }
    if (!this.combobox) {
      this.combobox = this.template.querySelector('.slds-combobox');
    }
    if (!this.clearButton) {
      this.clearButton = this.template.querySelector('.slds-button__icon');
    }
    this.setSearchBoxContainerClass();
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updateState() {
    if(this.state.value !== this.searchBox.state.value) {
      this.updateSearchboxText(this.searchBox.state.value);
    }
    this.state = this.searchBox.state;
  }

  setSearchBoxContainerClass() {
    if(this.withoutSubmitButton){
      this.searchBoxContainerClass = "slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right";
      this.input.setAttribute("aria-labelledby", "fixed-text-label")
    } else{
      this.searchBoxContainerClass = "slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right slds-input-has-fixed-addon";
      this.input.setAttribute("aria-labelledby", "fixed-text-label fixed-text-addon-post");
    }
  }

  showSuggestions() {
    this.combobox.classList.add('slds-is-open');
    this.combobox.setAttribute('aria-expanded', 'true');
  }

  hideSuggestions() {
    this.combobox.classList.remove('slds-is-open');
    this.combobox.setAttribute('aria-expanded', 'false');
    this.resetHighlighted();
    this.resetSelectionIndex();
  }

  setHighlighted() {
    const suggestions = this.getSuggestionElements();
    if (!suggestions.length) {
      return;
    }
    const suggestion = suggestions[this.selectionIndex];

    this.resetHighlighted();
    suggestion.setAttribute('aria-selected', 'true');
    suggestion.classList.add('slds-has-focus');
    this.input.value = suggestion.innerText;
  }

  resetHighlighted() {
    const options = this.getSuggestionElements();

    options.forEach((element) => {
      element.setAttribute('aria-selected', 'false');
      element.classList.remove('slds-has-focus');
    });
  }

  /**
   * @param {string} textValue
   */
  updateSearchboxText(textValue) {
    this.input.value = textValue;
    this.searchBox.updateText(textValue);
  }

  handleEnter() {
    if (this.selectionIndex >= 0) {
      this.searchBox.updateText(this.input.value);
    }
    this.searchBox.submit();
    this.input.blur();
  }

  handleArrowUp() {
    this.selectionIndex--;
    if (this.selectionIndex < 0) {
      this.selectionIndex = this.suggestions.length - 1;
    }
    this.setHighlighted();
  }

  handleArrowDown() {
    this.selectionIndex++;
    if (this.selectionIndex > this.suggestions.length - 1) {
      this.selectionIndex = 0;
    }
    this.setHighlighted();
  }

  onSubmit(){
    this.searchBox.updateText(this.input.value);
    this.searchBox.submit();
    this.input.blur();
  }

  /**
   * @param {KeyboardEvent & {target: {value : string}}} event
   */
  onKeyup(event) {
    if (event.which === ENTER) {
      this.handleEnter();
    } else if (this.areSuggestionsShown() && event.which === ARROWUP) {
      this.handleArrowUp();
    } else if (this.areSuggestionsShown() && event.which === ARROWDOWN) {
      this.handleArrowDown();
    } else {
      this.resetSelectionIndex();
      this.resetHighlighted();
      this.searchBox.updateText(event.target.value);
    }
  }

  onFocus() {
    this.clearButton.classList.remove('slds-hidden');
    this.clearButton.classList.add('slds-visible');
    this.searchBox.showSuggestions();
    this.showSuggestions();
  }

  onBlur() {
    this.clearButton.classList.remove('slds-visible');
    this.clearButton.classList.add('slds-hidden');
    this.hideSuggestions();
  }

  clearInput() {
    this.input.value = '';
    this.searchBox.updateText(this.input.value);
  }

  preventDefault(event) {
    event.preventDefault();
  }

  handleSuggestionSelection(event) {
    const textValue = event.target.innerText;
    this.updateSearchboxText(textValue);
    this.searchBox.submit();
    this.input.blur();
  }
}
