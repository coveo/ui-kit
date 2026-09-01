import {
  getHeadlessBundle,
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {api, LightningElement} from 'lwc';

export default class ActionPerformSearch extends LightningElement {
  @api engineId;
  @api disabled;
  @api withInput = false;

  searchBox;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    const headless = getHeadlessBundle(this.engineId);
    this.searchBox = headless.buildSearchBox(engine, {
      options: {
        numberOfSuggestions: 0,
      },
    });
  };

  handlePerformSearch() {
    const query = this.refs.input?.value ?? '';
    this.searchBox?.updateText(query);
    this.searchBox?.submit();
  }
}
