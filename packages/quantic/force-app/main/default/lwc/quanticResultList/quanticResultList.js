import {LightningElement, api, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").ResultList} ResultList */
/** @typedef {import("coveo").ResultListState} ResultListState */
/** @typedef {import("coveo").ResultTemplatesManager} ResultTemplatesManager */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticResultList` component is responsible for displaying query results by applying one or more result templates.
 * @fires CustomEvent#registerresulttemplates
 * @category Search
 * @example
 * <c-quantic-result-list engine-id={engineId} fields-to-include="objecttype,gdfiletitle"></c-quantic-result-list>
 */
export default class QuanticResultList extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * A list of fields to include in the query results, separated by commas.
   * @api
   * @type {string}
   * @defaultValue `'date,author,source,language,filetype,parents,sfknowledgearticleid'`
   */
  @api fieldsToInclude = 'date,author,source,language,filetype,parents,sfknowledgearticleid';

  /** @type {ResultListState}*/
  @track state;

  /** @type {ResultList} */
  resultList;
  /** @type {boolean} */
  showPlaceholder = true;
  /** @type {number} */
  numberOfResults = 10;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeSearchStatus;
  /** @type {Function} */
  unsubscribeResultsPerPage;
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
    this.resultsPerPage = CoveoHeadless.buildResultsPerPage(engine);
    this.unsubscribeResultsPerPage = this.resultsPerPage.subscribe(() => this.updateState());

    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );

    this.resultList = CoveoHeadless.buildResultList(engine, {
      options: {
        fieldsToInclude: this.fields
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
    this.unsubscribeSearchStatus?.();
    this.unsubscribeResultsPerPage?.();
  }

  updateState() {
    this.state = this.resultList?.state;
    this.numberOfResults = this.resultsPerPage?.state?.numberOfResults;
    this.showPlaceholder = this.searchStatus?.state?.isLoading && !this.searchStatus?.state?.hasError && !this.searchStatus?.state?.firstSearchExecuted && !!this.numberOfResults;
  }

  get fields() {
    if (this.fieldsToInclude.trim() === '') return [];
    return this.fieldsToInclude.split(',').map((field) => field.trim());
  }

  get hasResults() {
    return !!this.results.length;
  }

  get results() {
    return this.state?.results || [];
  }
}
