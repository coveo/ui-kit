import {
  getHeadlessBundle,
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

export default class ActionResultsPerPage extends LightningElement {
  @api engineId;
  @api disabled;

  resultsPerPage;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    const headless = getHeadlessBundle(this.engineId);
    this.resultsPerPage = headless.buildResultsPerPage(engine, {
      initialState: {numberOfResults: 10},
    });
  };

  handle() {
    const value = this.refs.input ? Number(this.refs.input.value) : 10;
    this.resultsPerPage?.set(value);
  }
}
