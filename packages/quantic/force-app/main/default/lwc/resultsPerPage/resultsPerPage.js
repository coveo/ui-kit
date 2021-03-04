import {LightningElement, api} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/headlessLoader';

export default class ResultsPerPage extends LightningElement {
  /** @type {import("coveo").ResultsPerPage} */
  resultsPerPage;

  /** @type {number} */
  currentResultsPerPageValue;

  /** @type {()=> void} */
  unsubscribe;

  /** @type {string} */
  @api engineId;

  constructor() {
    super();
    registerComponentForInit(this, 'sample-app');
  }
  
  connectedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /**
   * @param {import("coveo").Engine} engine
   */
  @api
  initialize(engine) {
    this.resultsPerPage = CoveoHeadless.buildResultsPerPage(engine);
    this.unsubscribe = this.resultsPerPage.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updateState() {
    this.currentResultsPerPageValue = this.resultsPerPage.state.numberOfResults;
  }

  /**
   * @param {CustomEvent<number>} event
   */
  goto(event) {
    this.resultsPerPage.set(event.detail);
  }

  resultsPerPageOptions = [10, 25, 50, 100];
}
