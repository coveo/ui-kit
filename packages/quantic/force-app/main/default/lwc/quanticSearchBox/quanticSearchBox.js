import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';

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
  @api placeholder = 'Search...';

  /** @type {number} */
  numberOfSuggestions = 5;
  /** @type {boolean} */
  hasSearchButton = true;
  /** @type {import("coveo").SearchBox} */
  searchBox;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  /** @type {number} */
  selectionIndex = -1;
  /** @type {HTMLInputElement} */
  input;
  /** @type {import("lwc").HTMLElementTheGoodPart} */
  combobox;
  /** @type {HTMLButtonElement} */
  clearButton;

  /** @type {() => void} */
  resetSelectionIndex = () => {
    this.selectionIndex = -1;
  };
  /** @type {() => boolean} */
  // @ts-ignore
  areSuggestionsShown = () =>
    this.template
      .querySelector('.slds-combobox')
      .classList.contains('slds-is-open');
  /** @type {() => HTMLElement[]} */
  // @ts-ignore
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
      // @ts-ignore
      this.input = this.template.querySelector('input');
    }
    if (!this.combobox) {
      // @ts-ignore
      this.combobox = this.template.querySelector('.slds-combobox');
    }
    if (!this.clearButton) {
      this.clearButton = this.template.querySelector('.slds-button__icon');
      this.clearButton.hidden = true;
    }
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updateState() {
    this.state = this.searchBox.state;
  }

  showSuggestions() {
    this.combobox.classList.add('slds-is-open');
    this.combobox.setAttribute('aria-expanded', true);
  }

  hideSuggestions() {
    this.combobox.classList.remove('slds-is-open');
    this.combobox.setAttribute('aria-expanded', false);
    this.resetHighlighted();
    this.resetSelectionIndex();
  }

  setHighlighted() {
    const options = this.getSuggestionElements();
    const option = options[this.selectionIndex];

    this.resetHighlighted();
    option.setAttribute('aria-selected', 'true');
    option.classList.add('slds-has-focus');
    this.input.value = option.textContent;
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
  }

  preventDefault(event) {
    event.preventDefault();
  }

  /**
   * @param {KeyboardEvent & {target: {textContent : string}}} event
   */
  handleSuggestionSelection(event) {
    const textValue = event.target.textContent;

    this.updateSearchboxText(textValue);
    this.searchBox.submit();
    this.input.blur();
  }
}
