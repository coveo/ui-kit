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
  /** @type {boolean}*/
  @track hasResults
  
  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.resultsPerPage = CoveoHeadless.buildResultsPerPage(engine);
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribe = this.resultsPerPage.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.unsubscribeSearchStatus) {
      this.unsubscribeSearchStatus();
    }
  }

  updateState() {
    this.currentResultsPerPageValue = this.resultsPerPage.state.numberOfResults;
    this.hasResults = this.searchStatus.state.hasResults;
  }

  /**
   * @param {CustomEvent<number>} event
   */
  goto(event) {
    this.resultsPerPage.set(event.detail);
  }

  resultsPerPageOptions = [10, 25, 50, 100];
}
