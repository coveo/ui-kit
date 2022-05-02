import {LightningElement, api, track, wire} from 'lwc';
import {CurrentPageReference, NavigationMixin} from 'lightning/navigation';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBindings,
  destroyEngine,
} from 'c/quanticHeadlessLoader';
import {STANDALONE_SEARCH_BOX_STORAGE_KEY, keys} from 'c/quanticUtils';

import search from '@salesforce/label/c.quantic_Search';
import clear from '@salesforce/label/c.quantic_Clear';

const CLASS_WITH_SUBMIT =
  'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right slds-input-has-fixed-addon';
const CLASS_WITHOUT_SUBMIT =
  'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").StandaloneSearchBoxState} StandaloneSearchBoxState */
/** @typedef {import("coveo").StandaloneSearchBox} StandaloneSearchBox */
/** @typedef {import("c/quanticSearchBoxSuggestionsList").default} quanticSearchBoxSuggestionsList */
/** @typedef {{key: number, value: string}} Suggestion */

/**
 * The `QuanticStandaloneSearchBox` component creates a search box with built-in support for query suggestions.
 * See [Use a Standalone Search Box](https://docs.coveo.com/en/quantic/latest/usage/ssb-usage/).
 * @category Search
 * @example
 * <c-quantic-standalone-search-box engine-id={engineId} placeholder="Enter a query..." without-submit-button number-of-suggestions="8" redirect-url="/my-search-page/%40uri" search-hub="myhub" pipeine="mypipeline"></c-quantic-standalone-search-box>
 */
export default class QuanticStandaloneSearchBox extends NavigationMixin(
  LightningElement
) {
  labels = {
    search,
    clear,
  };

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The placeholder text to display in the search box input area.
   * @api
   * @type {string}
   * @defaultValue 'Search...'
   */
  @api placeholder = `${this.labels.search}`;
  /**
   * Whether not to render a submit button.
   * @api
   * @type {boolean}
   * @defaultValue 'false'
   */
  @api withoutSubmitButton = false;
  /**
   * The maximum number of suggestions to display.
   * @api
   * @type {number}
   * @defaultValue 5
   */
  @api numberOfSuggestions = 5;
  /**
   * The url of the search page to redirect to when a query is made.
   * The target search page should contain a `QuanticSearchInterface` with the same engine ID as the one specified for this component.
   * @api
   * @type {string}
   * @defaultValue '/global-search/%40uri'
   */
  @api redirectUrl = '/global-search/%40uri';
  /**
   * The [search hub](https://docs.coveo.com/en/1342/) to use for this Standalone Search Box.
   * This value does not affect the target search page after redirection.
   * Setting the searchhub to be used on the target search page should be done on said search page component.
   * @api
   * @type {string}
   * @defaultValue 'default'
   */
  @api searchHub = 'default';
  /**
   * The [query pipeline](https://docs.coveo.com/en/180/) to use for this Standalone Search Box.
   * This value does not affect the target search page after redirection.
   * Setting the pipeline to be used on the target search page should be done on said search page component.
   * @api
   * @type {string}
   * @defaultValue `undefined`
   */
  @api pipeline;

  /** @type {boolean} */
  @track isStandalone = true;
  /** @type {StandaloneSearchBoxState} */
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

  /** @type {StandaloneSearchBox} */
  standaloneSearchBox;
  /** @type {Function} */
  unsubscribe;
  /** @type {boolean} */
  isInitialized;

  /** @type {Suggestion[]} */
  get suggestions() {
    return this.state.suggestions.map((s, index) => ({
      key: index,
      rawValue: s.rawValue,
      value: s.highlightedValue,
    }));
  }

  /** @type {string} */
  get standaloneEngineId() {
    return `${this.engineId}_standalone`;
  }

  connectedCallback() {
    registerComponentForInit(this, this.standaloneEngineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.standaloneEngineId, this.initialize);
    if (!this.isInitialized && !!this.standaloneSearchBox && !!this.input) {
      this.input.setAttribute('is-initialized', 'true');
      this.isInitialized = true;
    }
  }

  @wire(CurrentPageReference)
  handlePageChange() {
    this.isStandalone = !window.location.href.includes(this.redirectUrl);
    if (!this.isStandalone && this.standaloneEngine) {
      this.initialize(this.standaloneEngine);
    }
    if (this.isStandalone) {
      destroyEngine(this.engineId);
    }
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.standaloneSearchBox = CoveoHeadless.buildStandaloneSearchBox(engine, {
      options: {
        numberOfSuggestions: Number(this.numberOfSuggestions),
        highlightOptions: {
          notMatchDelimiters: {
            open: '<b>',
            close: '</b>',
          },
        },
        redirectionUrl: 'http://placeholder.com',
      },
    });
    this.standaloneEngine = engine;
    this.unsubscribe = this.standaloneSearchBox.subscribe(() =>
      this.updateStandaloneState()
    );
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateStandaloneState() {
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
    return this.withoutSubmitButton
      ? 'slds-input searchbox__input'
      : 'slds-input searchbox__input searchbox__input-with-button';
  }

  showSuggestions() {
    this.standaloneSearchBox?.showSuggestions();
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
    } else {
      this.standaloneSearchBox.submit();
    }
    this.input.blur();
  }

  onSubmit(event) {
    event.stopPropagation();
    if (this.standaloneSearchBox.state.value !== this.input.value) {
      this.standaloneSearchBox.updateText(this.input.value);
    }
    this.standaloneSearchBox.submit();
    this.input.blur();
  }

  onKeyup(event) {
    switch (event.key) {
      case keys.ENTER:
        this.handleEnter();
        break;
      case keys.ARROWUP:
        this.suggestionList.selectionUp();
        break;
      case keys.ARROWDOWN:
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

  resetStandaloneSearchboxState() {
    const engine = getHeadlessBindings(this.standaloneEngineId)?.engine;
    if (!engine) {
      return;
    }
    const {updateQuery} = CoveoHeadless.loadQueryActions(engine);

    engine.dispatch(updateQuery({q: ''}));
  }

  navigateToSearchPage() {
    const value = this.standaloneSearchBox.state.value;

    this.resetStandaloneSearchboxState();
    this[NavigationMixin.Navigate](
      {
        type: 'standard__webPage',
        attributes: {
          url: `${this.redirectUrl}#q=${value}`,
        },
      },
      false
    );
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
   * @returns {quanticSearchBoxSuggestionsList}
   */
  get suggestionList() {
    // @ts-ignore
    return this.template.querySelector('c-quantic-search-box-suggestions-list');
  }

  /**
   * @returns {boolean}
   */
  get isQueryEmpty() {
    return !this.input?.value?.length;
  }

  /**
   * @returns {boolean}
   */
  get suggestionsOpen() {
    return this.combobox?.classList.contains('slds-is-open');
  }
}
