import {getHeadlessBundle} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

export default class ActionResultsPerPage extends LightningElement {
  @api engineId;
  @api disabled;

  resultsPerPage;
  input;
  headless;

  handle() {
    if (!this.input) {
      this.input = this.template.querySelector('lightning-input');
    }
    const value = this.input ? Number(this.input.value) : 10;
    if (this.resultsPerPage) {
      this.resultsPerPage.set(value);
    } else {
      this.resolveResultsPerPageController().then((controller) => {
        this.resultsPerPage = controller;
        this.resultsPerPage.set(value);
      });
    }
  }

  resolveResultsPerPageController() {
    this.headless = getHeadlessBundle(this.engineId);
    return window.coveoHeadless?.[this.engineId]?.enginePromise.then(
      (engine) => {
        return this.headless.buildResultsPerPage(engine, {
          initialState: {numberOfResults: 10},
        });
      }
    );
  }
}
