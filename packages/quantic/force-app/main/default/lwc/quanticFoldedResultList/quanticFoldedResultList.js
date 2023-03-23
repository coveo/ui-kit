import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").FoldedResultList} FoldedResultList */
/** @typedef {import("coveo").FoldedResultListState} FoldedResultListState */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").ResultTemplatesManager} ResultTemplatesManager */
/** @typedef {import("coveo").ResultsPerPage} ResultsPerPage */

/**
 * The `QuanticFoldedResultList` component is responsible for displaying query results by applying one or more result templates.
 * This component can display query results that have a parent-child relationship with any level of nesting.
 * @fires CustomEvent#registerresulttemplates
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
   * @defaultValue `'date,author,source,language,filetype,parents,sfknowledgearticleid'`
   */
  @api fieldsToInclude =
    'date,author,source,language,filetype,parents,sfknowledgearticleid';
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
    this.headless = getHeadlessBundle(this.engineId);
    this.foldedResultList = this.headless.buildFoldedResultList(engine, {
      options: {
        fieldsToInclude: this.fields,
        folding: {
          numberOfFoldedResults: this.numberOfFoldedResults,
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
      new CustomEvent('registerresulttemplates', {
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
  }

  updateResultPerPage() {
    this.numberOfResults = this.resultsPerPage.state.numberOfResults;
  }

  get fields() {
    if (this.fieldsToInclude.trim() === '') return [];
    return this.fieldsToInclude
      .split(',')
      .map((field) => field.trim())
      .filter((field) => field.length > 0);
  }

  get collections() {
    return this?.state?.results || [];
  }
}
