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
  @api choicesDisplayed = '10,25,50,100';
  /**
   * The initial selection for the number of result per page. This should be part of the `choicesDisplayed` option. By default, this is set to the first value in `choicesDisplayed`.
   * @api
   * @type {number}
   * @defaultValue `the first value in 'choicesDisplayed'`
   */
  @api
  get initialChoice() {
    return this._initialChoice;
  }
  set initialChoice(value) {
    this._initialChoice = value;
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
  _initialChoice;

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
    this.headless = getHeadlessBundle(this.engineId);
    this.resultsPerPage = this.headless.buildResultsPerPage(engine, {
      initialState: {
        numberOfResults: Number(this.initialChoice) ?? this.choices[0],
      },
    });
    this.searchStatus = this.headless.buildSearchStatus(engine);
    this.unsubscribe = this.resultsPerPage.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );
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
        console.error(
          `The choice value "${choice}" from the "choicesDisplayed" option is not a number.`
        );
        this.setInitializationError();
      }
      return parsedChoice;
    });
  }

  validateInitialChoice() {
    if (!this.choices.includes(Number(this.initialChoice))) {
      console.error(
        `The "initialChoice" option value "${this.initialChoice}" is not included in the "choicesDisplayed" option "${this.choicesDisplayed}". Defaulting to the first value of the choices.`
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
