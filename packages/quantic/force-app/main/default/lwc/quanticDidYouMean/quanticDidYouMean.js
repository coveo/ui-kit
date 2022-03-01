import { api, LightningElement, track } from 'lwc';
import { initializeWithHeadless, registerComponentForInit } from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';

import didYouMean from '@salesforce/label/c.quantic_DidYouMean';
import noResultsFor from '@salesforce/label/c.quantic_NoResultsFor';
import queryCorrectedTo from '@salesforce/label/c.quantic_QueryCorrectedTo';

/** @typedef {import("coveo").DidYouMean} DidYouMean */
/** @typedef {import("coveo").Unsubscribe} Unsubscribe */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticDidYouMean` component is responsible for handling query corrections.
 * When a query returns no result but finds a possible query correction, the component either suggests the correction or automatically triggers a new query with the suggested term.
 * @category Search
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
  unsubscribe;
  /** @type {DidYouMean} */
  didYouMean;

  labels = {
    didYouMean,
    noResultsFor,
    queryCorrectedTo,
  }

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
    this.didYouMean = CoveoHeadless.buildDidYouMean(engine);
    this.unsubscribe = this.didYouMean.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.hasQueryCorrection = this.didYouMean.state.hasQueryCorrection;
    this.wasAutomaticallyCorrected = this.didYouMean.state.wasAutomaticallyCorrected;
    this.originalQuery = this.didYouMean.state.originalQuery;
    this.correctedQuery = this.didYouMean.state.queryCorrection.correctedQuery;
  }

  applyCorrection() {
    this.didYouMean.applyCorrection();
  }

  get noResultsLabel() {
    return I18nUtils.format(this.labels.noResultsFor, I18nUtils.getTextBold(I18nUtils.escapeHTML(this.originalQuery)));
  }

  get correctedQueryLabel() {
    return I18nUtils.format(this.labels.queryCorrectedTo, I18nUtils.getTextBold(I18nUtils.escapeHTML(this.correctedQuery)));
  }
}