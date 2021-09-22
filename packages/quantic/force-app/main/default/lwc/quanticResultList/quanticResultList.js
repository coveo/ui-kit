import {LightningElement, api, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

export default class QuanticResultList extends LightningElement {
  @track state = {};

  /** @type {import("coveo").ResultList} */
  resultList;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;
  /** @type {import("coveo").ResultTemplatesManager} */
  resultTemplatesManager;

  /** @type {string} */
  @api engineId;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  initialize = (engine) => {
    this.resultList = CoveoHeadless.buildResultList(engine,{
      options: {
        fieldsToInclude : ['date', 'filetype'],
      }
    });
    this.resultTemplatesManager = CoveoHeadless.buildResultTemplatesManager(
      engine
    );
    this.registerTemplates();
    this.unsubscribe = this.resultList.subscribe(() => this.updateState());
  }

  registerTemplates() {
    this.dispatchEvent(
      new CustomEvent('registerresulttemplates', {
        bubbles: true,
        detail: this.resultTemplatesManager,
      })
    );
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = this.resultList.state;
  }

  get results() {
    return this.state.results || [];
  }
}
