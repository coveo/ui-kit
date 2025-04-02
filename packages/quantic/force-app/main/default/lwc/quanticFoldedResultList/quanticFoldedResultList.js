import loadingResults from '@salesforce/label/c.quantic_LoadingResults';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {AriaLiveRegion} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").FoldedResultList} FoldedResultList */
/** @typedef {import("coveo").FoldedResultListState} FoldedResultListState */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").ResultTemplatesManager} ResultTemplatesManager */
/** @typedef {import("coveo").ResultsPerPage} ResultsPerPage */

/**
 * The `QuanticFoldedResultList` component is responsible for displaying query results by applying one or more result templates.
 * This component can display query results that have a parent-child relationship with any level of nesting.
 * @fires CustomEvent#quantic__registerresulttemplates
 * @category Search
 * @example
 * <c-quantic-folded-result-list engine-id={engineId} fields-to-include="objecttype,gdfiletitle" collection-field="foldingcollection" parent-field="foldingparent" child-field="foldingchild" number-of-folded-results="2"></c-quantic-folded-result-list>
 */
export default class QuanticFoldedResultList extends LightningElement {
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
  /**
   * The name of the field on which to do the folding.
   * @api
   * @type {string}
   * @defaultValue `'foldingcollection'`
   */
  @api collectionField = 'foldingcollection';
  /**
   * The name of the field that determines whether a certain result is a top result containing other child results within a collection.
   * @api
   * @type {string}
   * @defaultValue `'foldingparent'`
   */
  @api parentField = 'foldingparent';
  /**
   * The name of the field that uniquely identifies a result within collection.
   * @api
   * @type {string}
   * @defaultValue `'foldingchild'`
   */
  @api childField = 'foldingchild';
  /**
   * The number of child results to fold under the root collection element before expansion.
   * @api
   * @type {number}
   * @defaultValue `2`
   */
  @api numberOfFoldedResults = 2;

  /** @type {AnyHeadless} */
  headless;
  /** @type {FoldedResultList} */
  foldedResultList;
  /** @type {ResultTemplatesManager} */
  resultTemplatesManager;
  /** @type {ResultsPerPage} */
  resultsPerPage;
  /** @type {FoldedResultListState} */
  state;
  /** @type {boolean} */
  showPlaceholder = true;
  /** @type {number} */
  numberOfResults;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeResultsPerPage;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {import('c/quanticUtils').AriaLiveUtils} */
  loadingAriaLiveMessage;

  labels = {
    loadingResults,
  };

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
    this.loadingAriaLiveMessage = AriaLiveRegion('loading', this);
    this.headless = getHeadlessBundle(this.engineId);
    this.foldedResultList = this.headless.buildFoldedResultList(engine, {
      options: {
        fieldsToInclude: this.fields,
        folding: {
          // @ts-ignore
          numberOfFoldedResults: parseInt(this.numberOfFoldedResults, 10),
          childField: this.childField,
          collectionField: this.collectionField,
          parentField: this.parentField,
        },
      },
    });
    this.unsubscribe = this.foldedResultList.subscribe(() =>
      this.updateState()
    );

    this.resultsPerPage = this.headless.buildResultsPerPage(engine);
    this.unsubscribeResultsPerPage = this.resultsPerPage.subscribe(() =>
      this.updateResultPerPage()
    );

    this.resultTemplatesManager =
      this.headless.buildResultTemplatesManager(engine);
    this.registerTemplates();
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
    this.unsubscribeResultsPerPage?.();
  }

  updateState() {
    this.state = this.foldedResultList.state;
    this.showPlaceholder =
      this?.state?.isLoading &&
      !this?.state?.hasError &&
      !this?.state?.firstSearchExecuted &&
      !this?.state?.hasResults;
    if (this.showPlaceholder) {
      this.loadingAriaLiveMessage.dispatchMessage(this.labels.loadingResults);
    }
  }

  updateResultPerPage() {
    this.numberOfResults = this.resultsPerPage.state.numberOfResults;
  }

  get fields() {
    return this.fieldsToInclude
      .split(',')
      .map((field) => field.trim())
      .filter((field) => field.length > 0);
  }

  get collections() {
    // We need to add a unique key to each result to make sure to re-render the LWC when the results change.
    // If the unique key is only the result uniqueId, the LWC will not re-render when the results change AND the same result is still in the results.
    const searchResponseId = this?.state?.searchResponseId || Math.random();
    return (
      this?.state?.results?.map((collection) => ({
        ...collection,
        keyResultList: `${searchResponseId}_${collection.result.uniqueId}`,
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
