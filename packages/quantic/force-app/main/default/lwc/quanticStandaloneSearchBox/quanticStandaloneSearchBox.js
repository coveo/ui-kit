// @ts-nocheck
import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {
  NavigationMixin,
  // @ts-ignore
} from 'lightning/navigation';
import {
  STANDALONE_SEARCH_BOX_STORAGE_KEY
} from 'c/quanticUtils';

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

export default class QuanticStandaloneSearchBox extends NavigationMixin(
  LightningElement
) {
  
  labels = {
    search,
  };

  // Public props
  /** @type {number} */
  @api numberOfSuggestions = 5;
  /** @type {string} */
  @api placeholder = `${this.labels.search}...`;
  /** @type {string} */
  @api engineId;
  /** @type {boolean} */
  @api withoutSubmitButton = false;
  /** @type {string} */
  @api redirectUrl = '/global-search/%40uri';

  // Private props
  /** @type {import("coveo").StandaloneSearchBox} */
  standaloneSearchBox;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  /** @type {import("coveo").StandaloneSearchBoxState} */
  @track state = {
    analytics: {
      cause: '',
      metadata: null,
    },
    redirectTo: null,
    suggestions: [],
    value: '',
    isLoading: false,
    isLoadingSuggestions: false,
  };

  /** @type {{key: number, value: string}[]} */
  get suggestions() {
    return this.state.suggestions.map((s, index) => ({
      key: index,
      rawValue: s.rawValue,
      value: s.highlightedValue,
    }));
  }

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /**
   * @returns {HTMLInputElement}
   */
  get input() {
    return this.template.querySelector('input');
  }

  /**
   * @returns {HTMLElement}
   */
  get combobox() {
    return this.template.querySelector('.slds-combobox');
  }

  /**
   * @returns {import('c/quanticSearchBoxSuggestionsList').default}
   */
  get suggestionList() {
    return this.template.querySelector('c-quantic-search-box-suggestions-list');
  }

  /**
   * @returns {Boolean}
   */
  get isQueryEmpty() {
    return !this.input?.value?.length;
  }

  get suggestionsOpen() {
    return this.combobox?.classList.contains('slds-is-open');
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.standaloneSearchBox = CoveoHeadless.buildStandaloneSearchBox(engine, {
      options: {
        ...this.searchBoxOptions,
        redirectionUrl: 'http://placeholder.com',
      },
    });
    this.unsubscribe = this.standaloneSearchBox.subscribe(() =>
      this.updateState()
    );
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updateState() {
    if (this.state.value !== this.standaloneSearchBox.state.value) {
      this.input.value = this.standaloneSearchBox.state.value;
    }
    this.state = this.standaloneSearchBox.state;

    // Check for redirect
    const {redirectTo, value, analytics} = this.standaloneSearchBox.state;
    if (!redirectTo) {
      return;
    }

    localStorage.setItem(
      STANDALONE_SEARCH_BOX_STORAGE_KEY,
      JSON.stringify({
        value,
        analytics,
      })
    );
    this.navigateToSearchPage();
  }

  /**
    @returns {import("coveo").SearchBoxOptions}
   */
  get searchBoxOptions() {
    return {
      numberOfSuggestions: this.numberOfSuggestions,
      highlightOptions: {
        notMatchDelimiters: {
          open: '<b>',
          close: '</b>',
        },
      },
    };
  }

  get searchBoxContainerClass() {
    if (this.withoutSubmitButton) {
      if (this.input) {
        this.input.setAttribute('aria-labelledby', 'fixed-text-label');
      }
      return CLASS_WITH_SUBMIT;
    }
    if (this.input) {
      this.input.setAttribute(
        'aria-labelledby',
        'fixed-text-label fixed-text-addon-post'
      );
    }
    return CLASS_WITHOUT_SUBMIT;
  }

  showSuggestions() {
    this.standaloneSearchBox.showSuggestions();
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

  handleEnter() {
    const selectedSuggestion = this.suggestionList?.getCurrentSelectedValue();
    if (this.suggestionsOpen && selectedSuggestion) {
      this.standaloneSearchBox.selectSuggestion(selectedSuggestion.rawValue);
      this.input.blur();
    } else {
      this.standaloneSearchBox.submit();
      this.input.blur();
    }
  }

  onSubmit(event) {
    event.stopPropagation();
    if(this.standaloneSearchBox.state.value !== this.input.value) {
      this.standaloneSearchBox.updateText(this.input.value);
    }
    this.standaloneSearchBox.submit();
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
        this.suggestionList?.resetSelection();
        this.standaloneSearchBox.updateText(event.target.value);
    }
  }

  onFocus() {
    this.showSuggestions();
  }

  onBlur() {
    this.hideSuggestions();
  }

  clearInput() {
    this.input.value = '';
    this.standaloneSearchBox.updateText(this.input.value);
    this.input.focus();
  }

  handleSuggestionSelection(event) {
    const textValue = event.detail;
    this.standaloneSearchBox.selectSuggestion(textValue);
  }

  navigateToSearchPage() {
    // console.log(`NavigateTo: ${this.state.redirectTo}`);
    // Navigate to the search page
    // this[NavigationMixin.Navigate](
    //   {
    //     type: 'standard__webPage',
    //     attributes: {
    //       url: `${this.redirectUrl}#q=${this.standaloneSearchBox.state.value}`,
    //     },
    //   }, false
    // );
    window.location.replace(`${this.redirectUrl}#q=${this.standaloneSearchBox.state.value}`);
  }
}
