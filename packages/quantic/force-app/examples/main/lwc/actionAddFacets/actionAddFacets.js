import {api, LightningElement} from 'lwc';
import {
  getHeadlessBundle,
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';

export default class ActionAddFacets extends LightningElement {
  @api engineId;
  @api disabled;
  @api withoutInputs = false;
  @api label;

  searchBox;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.searchBox = this.headless.buildSearchBox(engine, {
      options: {
        numberOfSuggestions: 0,
      },
    });
  };

  handleAddFacets() {
    const eventName = this.withoutInputs
      ? 'addFacetsWithoutInputs'
      : 'addFacets';
    const addFacetsEvent = new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(addFacetsEvent);

    this.searchBox?.updateText('');
    this.searchBox?.submit();
  }
}
