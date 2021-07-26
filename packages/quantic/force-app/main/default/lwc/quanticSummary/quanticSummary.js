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

export default class QuanticSummary extends LightningElement {
  @track state = {};

  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").QuerySummary} */
  querySummary;
  /** @type {import("coveo").Unsubscribe} */
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
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.querySummary = CoveoHeadless.buildQuerySummary(engine);
    this.unsubscribe = this.querySummary.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  updateState() {
    this.state = this.querySummary.state;
  }

  get hasResults() {
    return this.state.hasResults;
  }

  get hasQuery() {
    return this.state.hasQuery;
  }

  get query() {
    return this.state.hasQuery ? `${this.state.query}` : '';
  }

  get range() {
    return `${this.state.firstResult}-${this.state.lastResult}`;
  }

  get total() {
    return this.state.total.toString();
  }

  get noResultsLabel() {
    return I18nUtils.format(
        this.hasQuery ? this.labels.noResultsFor : this.labels.noResults,
        I18nUtils.getTextBold(this.query));
  }

  get duration() {
    if (this.state.hasDuration) {
      const duration = this.state.durationInSeconds;
      const labelName = I18nUtils.getLabelNameWithCount('inSeconds', duration);
      return ` ${I18nUtils.format(this.labels[labelName], duration)}`;
    }
    return '';
  }

  get summaryLabel() {
    const labelName = this.hasQuery
      ? I18nUtils.getLabelNameWithCount('showingResultsOfWithQuery', this.state.lastResult)
      : I18nUtils.getLabelNameWithCount('showingResultsOf', this.state.lastResult);
    return `${I18nUtils.format(
      this.labels[labelName],
      I18nUtils.getTextBold(this.range),
      I18nUtils.getTextBold(this.total),
      I18nUtils.getTextBold(this.query))} ${this.duration}`;
  }
}
