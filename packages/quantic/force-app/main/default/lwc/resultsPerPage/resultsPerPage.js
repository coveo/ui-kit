// @ts-check
import { LightningElement, api } from 'lwc';
import { initializeComponent } from 'c/initialization';

export default class ResultsPerPage extends LightningElement {

  /** @type {import("coveo").ResultsPerPage} */
  resultsPerPage;

  /** @type {number} */
  currentResultsPerPageValue;

  /** @type {()=> void} */
  unsubscribe;

  connectedCallback() {
    initializeComponent(this);
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
    this.unsubscribe && this.unsubscribe();
  }

  updateState() {
    this.currentResultsPerPageValue = this.resultsPerPage.state.numberOfResults;
  }

   /**
   * @param {CustomEvent<number>} event
   */
  goto(event) {
    this.resultsPerPage.set(event.detail)
  }

  resultsPerPageOptions = [10, 25, 50, 100];
}
