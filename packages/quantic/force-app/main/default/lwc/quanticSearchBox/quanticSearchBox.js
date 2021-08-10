import { LightningElement, api, track } from 'lwc';
// @ts-ignore
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';

import search from '@salesforce/label/c.quantic_Search';

const KEYS = {
  ENTER: 'Enter',
  ARROWUP: 'ArrowUp',
  ARROWDOWN: 'ArrowDown',
}

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
    return this.searchBox.state.suggestions.map((s, index) => ({
      key: index,
      rawValue: s.rawValue,
      value: s.highlightedValue,
    }));
  }

  labels = {
    search
  }

  /** @type {string} */
  @api engineId;
  /** @type {string} */
  @api placeholder = `${this.labels.search}...`;
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
  /** @type {HTMLInputElement} */
  input;
  /** @type {HTMLElement} */
  combobox;
  /** @type {HTMLButtonElement} */
  clearButton;

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
    if (this.state.value !== this.searchBox.state.value) {
      this.updateSearchboxText(this.searchBox.state.value);
    }
    this.state = this.searchBox.state;
  }

  get suggestionList() {
    return this.template.querySelector('c-quantic-search-box-suggestions-list');
  }

  setSearchBoxContainerClass() {
    if (this.withoutSubmitButton) {
      this.searchBoxContainerClass = "slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right";
      this.input.setAttribute("aria-labelledby", "fixed-text-label")
    } else {
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
    this.suggestionList.resetSelection();
  }

  handleHighlightChange(event) {
    const suggestion = event.detail;
    this.input.value = suggestion.rawValue;
  }

  /**
   * @param {string} textValue
   */
  updateSearchboxText(textValue) {
    this.input.value = textValue;
    this.searchBox.updateText(textValue);
  }

  handleEnter() {
    if(this.searchBox.state.value !== this.input.value) {
      this.updateSearchboxText(this.input.value);
    }
    this.searchBox.submit();
    this.input.blur();
  }

  onSubmit() {
    this.searchBox.updateText(this.input.value);
    this.searchBox.submit();
    this.input.blur();
  }

  /**
   * @param {KeyboardEvent & {target: {value : string}}} event
   */
  onKeyup(event) {
    switch (event.key) {
      case KEYS.ENTER:
        this.handleEnter();
        break;
      case KEYS.ARROWUP:
        this.suggestionList.selectionUp();
        break;
      case KEYS.ARROWDOWN:
        this.suggestionList.selectionDown();
        break;
      default:
        this.suggestionList.resetSelection();
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
    this.input.focus();
  }

  handleSuggestionSelection(event) {
    const textValue = event.detail;
    this.updateSearchboxText(textValue);
    this.searchBox.submit();
    this.input.blur();
  }
}
