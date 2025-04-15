import didYouMean from '@salesforce/label/c.quantic_DidYouMean';
import noResultsFor from '@salesforce/label/c.quantic_NoResultsFor';
import queryCorrectedTo from '@salesforce/label/c.quantic_QueryCorrectedTo';
import searchInsteadFor from '@salesforce/label/c.quantic_SearchInsteadFor';
import showingResultsFor from '@salesforce/label/c.quantic_ShowingResultsFor';
import {
  getHeadlessBundle,
  initializeWithHeadless,
  registerComponentForInit,
} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';
import {api, LightningElement, track} from 'lwc';
// @ts-ignore
import didYouMeanTemplate from './templates/didYouMean.html';
// @ts-ignore
import errorTemplate from './templates/error.html';
// @ts-ignore
import queryTriggerTemplate from './templates/queryTrigger.html';

/** @typedef {import("coveo").DidYouMean} DidYouMean */
/** @typedef {import("coveo").QueryTrigger} QueryTrigger */
/** @typedef {import("coveo").Unsubscribe} Unsubscribe */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").QueryTriggerState} QueryTriggerState */

/**
 * The `QuanticDidYouMean` component is responsible for handling query corrections.
 * When a query returns no result but finds a possible query correction, the component either suggests the correction or automatically triggers a new query with the suggested term.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-did-you-mean engine-id={engineId} disable-query-auto-correction={disableQueryAutoCorrection} query-correction-mode="next"></c-quantic-did-you-mean>
 */
export default class QuanticDidYouMean extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * Whether to disable automatically applying corrections for queries that would otherwise return no results.
   * When `disableQueryAutoCorrection` is `false`, the component automatically triggers a new query using the suggested term.
   * When `disableQueryAutoCorrection` is `true`, the component returns the suggested term without triggering a new query.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api disableQueryAutoCorrection = false;
  /**
   * Defines which query correction system to use.
   * `legacy`: Query correction is powered by the legacy index system. This system relies on an algorithm using solely the index content to compute the suggested terms.
   * `next`: Query correction is powered by a machine learning system, requiring a valid query suggestion model configured in your Coveo environment to function properly. This system relies on machine learning algorithms to compute the suggested terms.
   * The `legacy` system will send two requests to the API to get the suggestions, while the `next` system will send one request.
   * @api
   * @type {string}
   * @defaultValue 'legacy'
   */
  @api queryCorrectionMode = 'legacy';

  /** @type {boolean}*/
  @track hasQueryCorrection;
  /** @type {boolean}*/
  @track wasAutomaticallyCorrected;
  /** @type {string}*/
  @track originalQuery;
  /** @type {string}*/
  @track correctedQuery;

  /** @type {Function} */
  unsubscribeDidYouMean;
  /** @type {Function} */
  unsubscribeQueryTrigger;
  /** @type {DidYouMean} */
  didYouMean;
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {QueryTrigger} */
  queryTrigger;
  /** @type {QueryTriggerState} */
  queryTriggerState;

  labels = {
    didYouMean,
    noResultsFor,
    queryCorrectedTo,
    showingResultsFor,
    searchInsteadFor,
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
    this.headless = getHeadlessBundle(this.engineId);
    this.didYouMean = this.headless.buildDidYouMean(engine, {
      options: {
        queryCorrectionMode: this.queryCorrectionMode,
        automaticallyCorrectQuery: !this.disableQueryAutoCorrection,
      },
    });
    this.queryTrigger = this.headless?.buildQueryTrigger?.(engine);
    this.unsubscribeDidYouMean = this.didYouMean.subscribe(() =>
      this.updateDidYouMeanState()
    );
    this.unsubscribeQueryTrigger = this.queryTrigger?.subscribe(() =>
      this.updateQueryTriggerState()
    );
  };

  disconnectedCallback() {
    this.unsubscribeDidYouMean?.();
    this.unsubscribeQueryTrigger?.();
  }

  updateDidYouMeanState() {
    this.hasQueryCorrection = this.didYouMean.state.hasQueryCorrection;
    this.wasAutomaticallyCorrected =
      this.didYouMean.state.wasAutomaticallyCorrected;
    this.originalQuery = this.didYouMean.state.originalQuery;
    this.correctedQuery = this.didYouMean.state.queryCorrection.correctedQuery;
  }

  updateQueryTriggerState() {
    this.queryTriggerState = this.queryTrigger?.state;
  }

  applyCorrection() {
    this.didYouMean.applyCorrection();
  }

  undo() {
    this.queryTrigger?.undo();
  }

  get noResultsLabel() {
    return I18nUtils.format(
      this.labels.noResultsFor,
      I18nUtils.getTextBold(I18nUtils.escapeHTML(this.originalQuery))
    );
  }

  get correctedQueryLabel() {
    return I18nUtils.format(
      this.labels.queryCorrectedTo,
      I18nUtils.getTextBold(I18nUtils.escapeHTML(this.correctedQuery))
    );
  }

  get showingResultsForLabel() {
    return I18nUtils.format(
      this.labels.showingResultsFor,
      I18nUtils.getTextBold(I18nUtils.escapeHTML(this.newTriggeredQuery))
    );
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  get wasQueryModifierByQueryTrigger() {
    return this?.queryTriggerState?.wasQueryModified;
  }

  get newTriggeredQuery() {
    return this.queryTriggerState?.newQuery;
  }

  get originalTriggeredQuery() {
    return this.queryTriggerState?.originalQuery;
  }

  render() {
    if (this.hasInitializationError) {
      return errorTemplate;
    }
    if (this.hasQueryCorrection) {
      return didYouMeanTemplate;
    }
    return queryTriggerTemplate;
  }
}
