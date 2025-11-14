import showNResultsPerPage from '@salesforce/label/c.quantic_ShowNResultsPerPage';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';
import {LightningElement, api, track} from 'lwc';

/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").ResultsPerPage} ResultsPerPage */

/**
 * The `QuanticResultsPerPage` component determines how many results to display per page.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-results-per-page engine-id={engineId} choices-displayed="5,10,20" initial-choice="5"></c-quantic-results-per-page>
 */
export default class QuanticResultsPerPage extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * A list of choices for the number of results to display per page, separated by commas.
   * @api
   * @type {string}
   * @defaultValue `'10,25,50,100'`
   */
  @api
  get choicesDisplayed() {
    return this._choicesDisplayed;
  }
  set choicesDisplayed(value) {
    if (this.validateChoicesDisplayed(value)) {
      this._choicesDisplayed = value;
    }
  }
  /**
   * The initial selection for the number of result per page. It must be a positive number and should be part of the `choicesDisplayed` option.
   * If omitted or not part of the `choicesDisplayed` option, it will default to the first value in `choicesDisplayed`.
   * @api
   * @type {number}
   * @defaultValue `the first value in 'choicesDisplayed'`
   */
  @api
  get initialChoice() {
    return this._initialChoice;
  }
  set initialChoice(value) {
    if (Number(value) > 0) {
      this._initialChoice = value;
    } else {
      console.error(`The initialChoice "${value}" must be a positive number.`);
      this.setInitializationError();
    }
  }

  /** @type {boolean}*/
  @track hasResults;
  /** @type {number[]} */
  @track choices = [];

  /** @type {ResultsPerPage} */
  resultsPerPage;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {number} */
  currentResultsPerPageValue;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeSearchStatus;
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {number} */
  _initialChoice;
  /** @type {string} */
  _choicesDisplayed = '10,25,50,100';

  labels = {
    showNResultsPerPage,
  };

  connectedCallback() {
    this.choices = this.parseChoicesDisplayed();
    if (!this._initialChoice) {
      this._initialChoice = this.choices[0];
    }
    this.validateInitialChoice();
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    if (!this.hasInitializationError) {
      this.headless = getHeadlessBundle(this.engineId);
      this.resultsPerPage = this.headless.buildResultsPerPage(engine, {
        initialState: {
          numberOfResults: Number(this.initialChoice) ?? this.choices[0],
        },
      });
      this.searchStatus = this.headless.buildSearchStatus(engine);
      this.unsubscribe = this.resultsPerPage.subscribe(() =>
        this.updateState()
      );
      this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
        this.updateState()
      );
    }
  };

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.currentResultsPerPageValue = this.resultsPerPage.state.numberOfResults;
    this.hasResults = this.searchStatus.state.hasResults;
  }

  parseChoicesDisplayed() {
    return this.choicesDisplayed.split(',').map((choice) => {
      const parsedChoice = parseInt(choice, 10);
      if (isNaN(parsedChoice)) {
        this.setInitializationError();
      }
      return parsedChoice;
    });
  }

  validateChoicesDisplayed(value) {
    let valid = true;
    value.split(',').forEach((choice) => {
      const parsedChoice = parseInt(choice, 10);
      if (isNaN(parsedChoice) || parsedChoice <= 0) {
        console.error(
          `The choice value "${choice}" from the "choicesDisplayed" option must be a positive number.`
        );
        this.setInitializationError();
        valid = false;
      }
    });
    return valid;
  }

  validateInitialChoice() {
    if (!this.choices.includes(Number(this.initialChoice))) {
      console.warn(
        `The initialChoice "${this.initialChoice}" is not included in the choicesDisplayed "${this.choicesDisplayed}". Defaulting to the first value in choicesDisplayed.`
      );
      this._initialChoice = this.choices[0];
    }
  }

  get choicesObjects() {
    return this.choices.map((choice) => ({
      value: choice,
      selected: choice === this.currentResultsPerPageValue,
      ariaLabelValue: I18nUtils.format(this.labels.showNResultsPerPage, choice),
    }));
  }

  /**
   * @param {CustomEvent<number>} event
   */
  select(event) {
    this.resultsPerPage.set(event.detail);
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
