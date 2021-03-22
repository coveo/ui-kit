import { LightningElement, api, track } from 'lwc';
// @ts-ignore
import { registerComponentForInit, initializeWithHeadless } from 'c/headlessLoader';

const ENTER = 13;
const ARROWUP = 38;
const ARROWDOWN = 40;
const DEAFULT_PLACEHOLDER = 'Search';

export default class SearchBox extends LightningElement {
  /** @type {import("coveo").SearchBoxState} */
  @track state = {
    redirectTo: '',
    suggestions: [],
    value: '',
  };

  /** @type {any} */
  get suggestions() {
    return this.state.suggestions.map((s, index) => ({ key: index, value: s.rawValue }));
  }

  /** @type {boolean} */
  @api sample = false;
  /** @type {string} */
  @api engineId;
  /** @type {string} */
  @track placeholderText = DEAFULT_PLACEHOLDER;

  /** @type {import("coveo").SearchBox} */
  searchBox;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  /** @type {boolean} */
  areSuggestionsShown = () => (this.template.querySelector('.slds-combobox').classList.contains('slds-is-open'));
  /** @type {number} */
  selectionIndex = -1;

  resetSelectionIndex = () => (this.selectionIndex = -1);

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  showSuggestions() {
    const combobox = this.template.querySelector('.slds-combobox');
    combobox.classList.add('slds-is-open');
    combobox.setAttribute("aria-expanded", true);
  }

  hideSuggestions() {
    const combobox = this.template.querySelector('.slds-combobox');
    combobox.classList.remove('slds-is-open');
    combobox.setAttribute('aria-expanded', false);
    this.resetHighlighted();
    this.resetSelectionIndex();
  }

  setHighlighted() {
    this.resetHighlighted();
    const options = this.template.querySelectorAll('.slds-listbox__option');
    options.forEach((element, index) => {
      if (index === this.selectionIndex) {
        element.setAttribute('aria-selected', true);
        element.classList.add('slds-has-focus');
        this.placeholderText = element.textContent;
      }
    });
  }

  resetHighlighted() {
    const options = this.template.querySelectorAll('.slds-listbox__option');
    options.forEach((element) => {
      element.setAttribute('aria-selected', false);
      element.classList.remove('slds-has-focus');
    });
    this.placeholderText = DEAFULT_PLACEHOLDER;
  }

  /**
   * @param {import("coveo").Engine} engine
   */
  @api
  initialize(engine) {
    this.searchBox = CoveoHeadless.buildSearchBox(engine);
    this.unsubscribe = this.searchBox.subscribe(() => this.updateState());
  }

  updateState() {
    this.state = this.searchBox.state;
  }

  /**
   * @param {string} textValue
   */
  updateSearchboxText(textValue) {
    this.template.querySelector('input').value = textValue;
    this.searchBox.updateText(textValue);
  }

  handleEnter() {
    if (this.selectionIndex >= 0) {
      this.updateSearchboxText(this.placeholderText);
      this.hideSuggestions();
    }
    this.searchBox.submit();
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
    }
    this.searchBox.updateText(event.target.value);
  }

  onFocus() {
    this.searchBox.showSuggestions();
    this.showSuggestions();
  }

  onBlur() {
    this.hideSuggestions();
  }

  preventDefault(event) {
    event.preventDefault();
  }

  /**
   * @param {KeyboardEvent & {target: {value : string}}} event
   */
  handleSuggestionSelection(event) {
    const textValue = event.target.textContent;

    this.updateSearchboxText(textValue);
    this.searchBox.submit();
    this.hideSuggestions();
  }
}
