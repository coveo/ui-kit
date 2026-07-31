import LOCALE from '@salesforce/i18n/locale';
import allResultsLoaded from '@salesforce/label/c.quantic_AllResultsLoaded';
import loadMoreResults from '@salesforce/label/c.quantic_LoadMoreResults';
import showingResultsOfLoadMore from '@salesforce/label/c.quantic_ShowingResultsOfLoadMore';
import showingResultsOfLoadMore_plural from '@salesforce/label/c.quantic_ShowingResultsOfLoadMore_plural';
import showingResultsOfLoadMore_zero from '@salesforce/label/c.quantic_ShowingResultsOfLoadMore_zero';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {AriaLiveRegion, I18nUtils} from 'c/quanticUtils';
import {LightningElement, api, track} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").ResultList} ResultList */
/** @typedef {import("coveo").ResultListState} ResultListState */
/** @typedef {import("coveo").QuerySummary} QuerySummary */
/** @typedef {import("coveo").QuerySummaryState} QuerySummaryState */

/**
 * The `QuanticLoadMoreResults` component allows the end user to load additional results into the
 * current result list without navigating to a new page.
 *
 * Use `quantic-load-more-results` as an alternative to `quantic-pager` for letting users see more
 * results — do not combine the two on the same page. `quantic-pager` provides traditional
 * page-based navigation, while `quantic-load-more-results` incrementally appends results to the
 * existing list.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-load-more-results engine-id={engineId}></c-quantic-load-more-results>
 */
export default class QuanticLoadMoreResults extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  /** @type {ResultListState} */
  @track resultListState;
  /** @type {QuerySummaryState} */
  @track querySummaryState;

  /** @type {ResultList} */
  resultList;
  /** @type {QuerySummary} */
  querySummary;
  /** @type {Function} */
  unsubscribeResultList;
  /** @type {Function} */
  unsubscribeQuerySummary;
  /** @type {ResultListState} */
  previousResultListState;
  /** @type {AnyHeadless} */
  headless;
  /** @type {import('c/quanticUtils').AriaLiveUtils} */
  allResultsLoadedAriaMessage;
  /** @type {boolean} */
  hasInitializationError = false;

  labels = {
    allResultsLoaded,
    loadMoreResults,
    showingResultsOfLoadMore,
    showingResultsOfLoadMore_plural,
    showingResultsOfLoadMore_zero,
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
    this.resultList = this.headless.buildResultList(engine);
    this.querySummary = this.headless.buildQuerySummary(engine);
    this.allResultsLoadedAriaMessage = AriaLiveRegion('loadMoreResults', this);
    this.unsubscribeResultList = this.resultList.subscribe(() =>
      this.updateResultListState()
    );
    this.unsubscribeQuerySummary = this.querySummary.subscribe(() =>
      this.updateQuerySummaryState()
    );
  };

  disconnectedCallback() {
    this.unsubscribeResultList?.();
    this.unsubscribeQuerySummary?.();
  }

  updateResultListState() {
    this.previousResultListState = this.resultListState;
    this.resultListState = this.resultList.state;
    this.announceWhenAllResultsAreLoaded();
  }

  updateQuerySummaryState() {
    this.querySummaryState = this.querySummary.state;
  }

  announceWhenAllResultsAreLoaded() {
    const justLoadedLastBatch =
      this.previousResultListState?.moreResultsAvailable === true &&
      this.resultListState?.moreResultsAvailable === false &&
      this.previousResultListState?.searchResponseId ===
        this.resultListState?.searchResponseId;

    if (justLoadedLastBatch) {
      this.allResultsLoadedAriaMessage.dispatchMessage(
        this.labels.allResultsLoaded
      );
    }
  }

  fetchMoreResults() {
    this.resultList.fetchMoreResults();
  }

  get hasResults() {
    return !!this.resultListState?.hasResults;
  }

  get moreResultsAvailable() {
    return !!this.resultListState?.moreResultsAvailable;
  }

  get total() {
    return Intl.NumberFormat(LOCALE)
      .format(this.querySummaryState?.total)
      .toString();
  }

  get lastResult() {
    return Intl.NumberFormat(LOCALE)
      .format(this.querySummaryState?.lastResult)
      .toString();
  }

  get summaryLabel() {
    const labelName = I18nUtils.getLabelNameWithCount(
      'showingResultsOfLoadMore',
      this.querySummaryState?.lastResult
    );
    return I18nUtils.format(
      this.labels[labelName],
      this.lastResult,
      this.total
    );
  }

  /**
   * @returns {number}
   */
  get progressPercentage() {
    const total = this.querySummaryState?.total;
    if (!total) {
      return 0;
    }
    return Math.min(100, (this.querySummaryState?.lastResult / total) * 100);
  }

  get progressBarStyle() {
    return `width: ${this.progressPercentage}%;`;
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
