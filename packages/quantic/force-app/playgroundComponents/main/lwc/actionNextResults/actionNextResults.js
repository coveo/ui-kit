import {
  getHeadlessBundle,
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

export default class ActionNextResults extends LightningElement {
  @api engineId;
  @api disabled;

  pager;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    const headless = getHeadlessBundle(this.engineId);
    this.pager = headless.buildPager(engine);
  };

  handleGetNextResults() {
    this.pager?.nextPage();
  }
}
