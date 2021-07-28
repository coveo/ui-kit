import { api, LightningElement, track } from 'lwc';
import { initializeWithHeadless, registerComponentForInit } from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';

import didYouMean from '@salesforce/label/c.quantic_DidYouMean';
import noResultsFor from '@salesforce/label/c.quantic_NoResultsFor';
import queryCorrectedTo from '@salesforce/label/c.quantic_QueryCorrectedTo';

export default class QuanticDidYouMean extends LightningElement {
  /** @type {()=> void} */
  unsubscribe;
  /** @type {Boolean}*/
  @track hasQueryCorrection;
  /** @type {Boolean}*/
  @track wasAutomaticallyCorrected;
  /** @type {string}*/
  @track originalQuery;
  /** @type {string}*/
  @track correctedQuery;
  /** @type {string}*/
  @api engineId;

  /** @type {import("coveo").DidYouMean} */
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
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.didYouMean = CoveoHeadless.buildDidYouMean(engine);
    this.unsubscribe = this.didYouMean.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
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
    return I18nUtils.format(this.labels.noResultsFor, I18nUtils.getTextBold(this.originalQuery));
  }

  get correctedQueryLabel() {
    return I18nUtils.format(this.labels.queryCorrectedTo, I18nUtils.getTextBold(this.correctedQuery));
  }
}