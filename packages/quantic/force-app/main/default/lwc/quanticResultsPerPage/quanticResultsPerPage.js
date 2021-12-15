import {LightningElement, api, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").ResultsPerPage} ResultsPerPage */

/**
 * The `QuanticResultsPerPage` component determines how many results to display per page.
 * @category Search
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
   * @defaultValue `10`
   */
  @api initialChoice = 10;

  /** @type {boolean}*/
  @track hasResults
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
  
  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.choices = this.parseChoicesDisplayed();
    this.validateInitialChoice();
    this.resultsPerPage = CoveoHeadless.buildResultsPerPage(engine, {
      initialState: {numberOfResults: Number(this.initialChoice) ?? this.choices[0]},
    });
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribe = this.resultsPerPage.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => this.updateState());
  }

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
        throw new Error(`The choice value "${choice}" from the "choicesDisplayed" option is not a number.`);
      }
      return parsedChoice;
    });
  }

  validateInitialChoice() {
    if (!this.choices.includes(Number(this.initialChoice))) {
      throw new Error(`The "initialChoice" option value "${this.initialChoice}" is not included in the "choicesDisplayed" option "${this.choicesDisplayed}".`);
    }
  }

  get choicesObjects() {
    return this.choices.map((choice) => ({
      value: choice,
      selected: choice === this.currentResultsPerPageValue
    }));
  }

  /**
   * @param {CustomEvent<number>} event
   */
  select(event) {
    this.resultsPerPage.set(event.detail);
  }
}
