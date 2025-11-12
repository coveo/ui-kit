import LOCALE from '@salesforce/i18n/locale';
import noResults from '@salesforce/label/c.quantic_NoResults';
import noResultsFor from '@salesforce/label/c.quantic_NoResultsFor';
import showingResultsOf from '@salesforce/label/c.quantic_ShowingResultsOf';
import showingResultsOfWithQuery from '@salesforce/label/c.quantic_ShowingResultsOfWithQuery';
import showingResultsOfWithQuery_plural from '@salesforce/label/c.quantic_ShowingResultsOfWithQuery_plural';
import showingResultsOf_plural from '@salesforce/label/c.quantic_ShowingResultsOf_plural';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {AriaLiveRegion, I18nUtils} from 'c/quanticUtils';
import {LightningElement, track, api} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").QuerySummary} QuerySummary */
/** @typedef {import("coveo").QuerySummaryState} QuerySummaryState */

/**
 * The `QuanticSummary` component displays information about the current range of results (for example, "Results 1-10 of 123").
 * @category Search
 * @category Insight Panel
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
  /** @type {AnyHeadless} */
  headless;
  /** @type {import('c/quanticUtils').AriaLiveUtils} */
  summaryAriaMessage;
  /** @type {boolean} */
  hasInitializationError = false;

  labels = {
    noResults,
    noResultsFor,
    showingResultsOf,
    showingResultsOf_plural,
    showingResultsOfWithQuery,
    showingResultsOfWithQuery_plural,
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
    this.querySummary = this.headless.buildQuerySummary(engine);
    this.summaryAriaMessage = AriaLiveRegion('summary', this);
    this.unsubscribe = this.querySummary.subscribe(() => this.updateState());
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = this.querySummary.state;
    if (this.state?.hasResults) {
      this.updateAriaMessage();
    }
  }

  updateAriaMessage() {
    const docElement = document.createElement('div');
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    docElement.innerHTML = this.summaryLabel;
    this.summaryAriaMessage.dispatchMessage(docElement.innerText);
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
    return `${Intl.NumberFormat(LOCALE).format(
      this.state?.firstResult
    )}-${Intl.NumberFormat(LOCALE).format(this.state?.lastResult)}`;
  }

  get total() {
    return Intl.NumberFormat(LOCALE).format(this.state?.total).toString();
  }

  get noResultsLabel() {
    return I18nUtils.format(
      this.hasQuery ? this.labels.noResultsFor : this.labels.noResults,
      I18nUtils.getTextBold(I18nUtils.escapeHTML(this.query))
    );
  }

  get summaryLabel() {
    const labelName = this.hasQuery
      ? I18nUtils.getLabelNameWithCount(
          'showingResultsOfWithQuery',
          this.state?.lastResult
        )
      : I18nUtils.getLabelNameWithCount(
          'showingResultsOf',
          this.state?.lastResult
        );
    return I18nUtils.format(
      this.labels[labelName],
      I18nUtils.getTextWithDecorator(
        this.range,
        '<b class="summary__range">',
        '</b>'
      ),
      I18nUtils.getTextWithDecorator(
        this.total,
        '<b class="summary__total">',
        '</b>'
      ),
      I18nUtils.getTextWithDecorator(
        I18nUtils.escapeHTML(this.query),
        '<b class="summary__query">',
        '</b>'
      )
    );
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
