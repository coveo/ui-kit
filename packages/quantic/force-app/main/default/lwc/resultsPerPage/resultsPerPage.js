import {LightningElement, api} from 'lwc';
import {initializeComponent} from 'c/initialization';
import {getHeadlessEngine} from 'c/headlessLoader';

export default class ResultsPerPage extends LightningElement {
  /** @type {import("coveo").ResultsPerPage} */
  resultsPerPage;

  /** @type {number} */
  currentResultsPerPageValue;

  /** @type {()=> void} */
  unsubscribe;

  connectedCallback() {
    try {
      getHeadlessEngine(this).then((engine) => {
        this.initialize(engine);
      })
    } catch (error) {
      console.error('Fatal error: unable to initialize component', error);
    }
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
