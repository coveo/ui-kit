import { LightningElement, api } from 'lwc';

export default class Resultsperpage extends LightningElement {

  /** @type {import("coveo").ResultsPerPage} */
  resultsPerPage;

  /** @type {number} */
  currentResultsPerPageValue;

  /** @type {()=> void} */
  unsubscribe;

  @api
  set engine(eng) {
    if (!eng) {
      return;
    }

    this.e = eng;
    this.resultsPerPage = CoveoHeadless.buildResultsPerPage(this.e);
    this.unsubscribe = this.resultsPerPage.subscribe(() => this.updateState());
  }

  get engine() {
    return this.e;
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
