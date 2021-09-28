import {LightningElement, api, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

export default class QuanticResultsPerPage extends LightningElement {
  /** @type {import("coveo").ResultsPerPage} */
  resultsPerPage;
  /** @type {import("coveo").SearchStatus} */
  searchStatus;

  /** @type {number} */
  currentResultsPerPageValue;

  /** @type {()=> void} */
  unsubscribe;
  /** @type {() => void} */
  unsubscribeSearchStatus;

  /** @type {string} */
  @api engineId;
  /** @type {string} */
  @api choicesDisplayed = '10,25,50,100';
  /** @type {number} */
  @api initialChoice = 10;

  /** @type {boolean}*/
  @track hasResults
  /** @type {number[]} */
  @track choices = [];
  
  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {import("coveo").SearchEngine} engine
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

  /**
   * @param {CustomEvent<number>} event
   */
  goto(event) {
    this.resultsPerPage.set(event.detail);
  }
}
