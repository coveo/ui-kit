import {LightningElement, api, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").ResultList} ResultList */
/** @typedef {import("coveo").ResultListState} ResultListState */
/** @typedef {import("coveo").ResultTemplatesManager} ResultTemplatesManager */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticResultList` component is responsible for displaying query results by applying one or more result templates.
 * @category LWC
 * @fires CustomEvent#registerresulttemplates
 * @example
 * <c-quantic-result-list engine-id={engineId}></c-quantic-result-list>
 */
export default class QuanticResultList extends LightningElement {
  /**
   * The ID of the engine instance with which to register.
   * @api
   * @type {string}
   */
  @api engineId;

  /** @type {ResultListState}*/
  @track state;

  /** @type {ResultList} */
  resultList;
  /** @type {Function} */
  unsubscribe;
  /** @type {ResultTemplatesManager} */
  resultTemplatesManager;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.resultList = CoveoHeadless.buildResultList(engine);
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
    return this.state?.results || [];
  }
}
