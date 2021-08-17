import {LightningElement, api, track} from 'lwc';
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
};

const CLASS_WITH_SUBMIT =
  'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right slds-input-has-fixed-addon';
const CLASS_WITHOUT_SUBMIT =
  'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right';

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
    search,
  };

  /** @type {string} */
  @api engineId;
  /** @type {string} */
  @api placeholder = `${this.labels.search}...`;
  /** @type {boolean} */
  @api withoutSubmitButton = false;
  /** @type {number} */
  @api numberOfSuggestions = 5;

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

  /**
   * @returns {import('c/quanticSearchBoxSuggestionsList').default}
   */
  get suggestionList() {
    // @ts-ignore
    return this.template.querySelector('c-quantic-search-box-suggestions-list');
  }

  get searchBoxContainerClass() {
    if (this.withoutSubmitButton) {
      this.input?.setAttribute('aria-labelledby', 'fixed-text-label');
      return CLASS_WITH_SUBMIT;
    }
    this.input?.setAttribute(
      'aria-labelledby',
      'fixed-text-label fixed-text-addon-post'
    );
    return CLASS_WITHOUT_SUBMIT;
  }

  get suggestionsOpen() {
    return this.combobox.classList.contains('slds-is-open');
  }

  showSuggestions() {
    this.searchBox.showSuggestions();
    this.combobox.classList.add('slds-is-open');
    this.combobox.setAttribute('aria-expanded', 'true');
  }

  hideSuggestions() {
    this.combobox.classList.remove('slds-is-open');
    this.combobox.setAttribute('aria-expanded', 'false');
    this.suggestionList?.resetSelection();
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
    if(this.searchBox.state.value !== this.input.value) {
      this.searchBox.updateText(this.input.value);
    }
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
        this.suggestionList?.selectionUp();
        break;
      case KEYS.ARROWDOWN:
        this.suggestionList?.selectionDown();
        break;
      default:
        this.suggestionList?.resetSelection();
        this.searchBox.updateText(event.target.value);
    }
  }

  onFocus() {
    this.clearButton.classList.remove('slds-hidden');
    this.clearButton.classList.add('slds-visible');
    this.showSuggestions();
  }

  onBlur() {
    this.hideSuggestions();
  }

  clearInput() {
    this.input.value = '';
    this.clearButton.classList.remove('slds-visible');
    this.clearButton.classList.add('slds-hidden');
    this.searchBox.updateText(this.input.value);
    this.input.focus();
  }

  handleSuggestionSelection(event) {
    const textValue = event.detail;
    this.searchBox.selectSuggestion(textValue);
    this.input.blur();
  }

  get isQueryEmpty() {
    return this.state.value === '';
  }
}
