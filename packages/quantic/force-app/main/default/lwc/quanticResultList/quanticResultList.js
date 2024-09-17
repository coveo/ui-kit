import loadingResults from '@salesforce/label/c.quantic_LoadingResults';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {AriaLiveRegion} from 'c/quanticUtils';
import {LightningElement, api, track} from 'lwc';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").ResultList} ResultList */
/** @typedef {import("coveo").ResultListState} ResultListState */
/** @typedef {import("coveo").ResultTemplatesManager} ResultTemplatesManager */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticResultList` component is responsible for displaying query results by applying one or more result templates.
 * @fires CustomEvent#quantic__registerresulttemplates
 * @category Search
 * @category Insight Panel
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
   * @defaultValue `'date,author,source,language,filetype,documenttype,parents,sfknowledgearticleid,sfid,sfkbid,sfkavid,sfparentid'`
   */
  @api fieldsToInclude =
    'date,author,source,language,filetype,documenttype,parents,sfknowledgearticleid,sfid,sfkbid,sfkavid,sfparentid';

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
  /** @type {AnyHeadless} */
  headless;
  /** @type {import('c/quanticUtils').AriaLiveUtils} */
  loadingAriaLiveMessage;
  /** @type {string} */
  openPreviewId;
  /** @type {boolean} */
  hasInitializationError = false;

  labels = {
    loadingResults,
  };

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.template.addEventListener(
      'quantic__resultpreviewtoggle',
      this.handleResultPreviewToggle
    );
  }

  handleResultPreviewToggle = (event) => {
    this.openPreviewId = event.detail.isOpen ? event.detail.resultId : null;
  };

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.loadingAriaLiveMessage = AriaLiveRegion('loading', this);
    this.headless = getHeadlessBundle(this.engineId);
    this.resultsPerPage = this.headless.buildResultsPerPage(engine);
    this.unsubscribeResultsPerPage = this.resultsPerPage.subscribe(() =>
      this.updateState()
    );

    this.searchStatus = this.headless.buildSearchStatus(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );

    this.resultList = this.headless.buildResultList(engine, {
      options: {
        fieldsToInclude: this.fields,
      },
    });
    this.resultTemplatesManager =
      this.headless.buildResultTemplatesManager(engine);
    this.registerTemplates();
    this.unsubscribe = this.resultList.subscribe(() => this.updateState());
  };

  registerTemplates() {
    this.dispatchEvent(
      new CustomEvent('quantic__registerresulttemplates', {
        bubbles: true,
        detail: this.resultTemplatesManager,
      })
    );
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
    this.unsubscribeResultsPerPage?.();
    this.template.removeEventListener(
      'quantic__resultpreviewtoggle',
      this.handleResultPreviewToggle
    );
  }

  updateState() {
    this.state = this.resultList?.state;
    this.numberOfResults = this.resultsPerPage?.state?.numberOfResults;
    this.showPlaceholder =
      this.searchStatus?.state?.isLoading &&
      !this.searchStatus?.state?.hasError &&
      !this.searchStatus?.state?.firstSearchExecuted &&
      !!this.numberOfResults;
    if (this.showPlaceholder) {
      this.loadingAriaLiveMessage.dispatchMessage(this.labels.loadingResults);
    }
  }

  get fields() {
    return this.fieldsToInclude
      .split(',')
      .map((field) => field.trim())
      .filter((field) => field.length > 0);
  }

  get hasResults() {
    return !!this.results.length;
  }

  get results() {
    // We need to add a unique key to each result to make sure to re-render the LWC when the results change.
    // If the unique key is only the result uniqueId, the LWC will not re-render when the results change AND the same result is still in the results.
    const searchResponseId = this?.state?.searchResponseId || Math.random();
    return (
      this.state?.results?.map((result) => ({
        ...result,
        keyResultList: `${searchResponseId}_${result.uniqueId}`,
      })) || []
    );
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
