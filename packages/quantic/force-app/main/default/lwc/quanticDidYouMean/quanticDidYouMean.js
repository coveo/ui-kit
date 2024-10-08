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
 * <c-quantic-did-you-mean engine-id={engineId}></c-quantic-did-you-mean>
 */
export default class QuanticDidYouMean extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

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
        queryCorrectionMode: 'legacy',
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
