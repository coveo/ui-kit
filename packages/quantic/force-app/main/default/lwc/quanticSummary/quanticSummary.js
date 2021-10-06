import {LightningElement, track, api} from 'lwc';

import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';

import noResults from '@salesforce/label/c.quantic_NoResults';
import noResultsFor from '@salesforce/label/c.quantic_NoResultsFor';
import showingResultsOf from '@salesforce/label/c.quantic_ShowingResultsOf';
import showingResultsOf_plural from '@salesforce/label/c.quantic_ShowingResultsOf_plural';
import showingResultsOfWithQuery from '@salesforce/label/c.quantic_ShowingResultsOfWithQuery';
import showingResultsOfWithQuery_plural from '@salesforce/label/c.quantic_ShowingResultsOfWithQuery_plural';
import inSeconds from '@salesforce/label/c.quantic_InSeconds';
import inSeconds_plural from '@salesforce/label/c.quantic_InSeconds_plural';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").QuerySummary} QuerySummary */
/** @typedef {import("coveo").QuerySummaryState} QuerySummaryState */

/**
 * The `QuanticSummary` component displays information about the current range of results and the request duration (e.g., "Results 1-10 of 123 in 0.47 seconds").
 * @example
 * <c-quantic-summary engine-id={engineId}></c-quantic-summary>
 */
export default class QuanticSummary extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  /** @type {QuerySummaryState} */
  @track state;

  /** @type {QuerySummary} */
  querySummary;
  /** @type {Function} */
  unsubscribe;

  labels = {
    noResults,
    noResultsFor,
    showingResultsOf,
    showingResultsOf_plural,
    showingResultsOfWithQuery,
    showingResultsOfWithQuery_plural,
    inSeconds,
    inSeconds_plural,
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
    this.querySummary = CoveoHeadless.buildQuerySummary(engine);
    this.unsubscribe = this.querySummary.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }
  
  updateState() {
    this.state = this.querySummary.state;
  }

  get hasResults() {
    return this.state?.hasResults;
  }

  get hasQuery() {
    return this.state?.hasQuery;
  }

  get query() {
    return this.state?.hasQuery ? `${this.state.query}` : '';
  }

  get range() {
    return `${this.state?.firstResult}-${this.state?.lastResult}`;
  }

  get total() {
    return this.state?.total.toString();
  }

  get noResultsLabel() {
    return I18nUtils.format(
        this.hasQuery ? this.labels.noResultsFor : this.labels.noResults,
        I18nUtils.getTextBold(this.query));
  }

  get summaryLabel() {
    const labelName = this.hasQuery
      ? I18nUtils.getLabelNameWithCount('showingResultsOfWithQuery', this.state?.lastResult)
      : I18nUtils.getLabelNameWithCount('showingResultsOf', this.state?.lastResult);
    return I18nUtils.format(
      this.labels[labelName],
      I18nUtils.getTextBold(this.range),
      I18nUtils.getTextBold(this.total),
      I18nUtils.getTextBold(this.query));
  }
}
