import noResultsForTitle from '@salesforce/label/c.quantic_NoResultsForTitle';
import noResultsTitle from '@salesforce/label/c.quantic_NoResultsTitle';
import noResultsWithFilters from '@salesforce/label/c.quantic_NoResultsWithFilters';
import noResultsWithoutFilters from '@salesforce/label/c.quantic_NoResultsWithoutFilters';
import undoLastAction from '@salesforce/label/c.quantic_UndoLastAction';
import {
  initializeWithHeadless,
  registerComponentForInit,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {AriaLiveRegion, I18nUtils} from 'c/quanticUtils';
import {api, LightningElement, track} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").HistoryManager} HistoryManager */
/** @typedef {import("coveo").QuerySummary} QuerySummary*/
/** @typedef {import("coveo").BreadcrumbManager} BreadcrumbManager */

/**
 * The `QuanticNoResults` component displays search tips and a "Cancel last action" button when there are no results. Any additional content embedded inside the component will be displayed as well.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-no-results engine-id={engineId} disable-cancel-last-action></c-quantic-no-results>
 */
export default class QuanticNoResults extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * Whether to display a button which cancels the last available action.
   * @api
   * @type {boolean}
   * @defaultValue false
   */
  @api disableCancelLastAction = false;

  /** @type {boolean} */
  @track showNoResultsPanel;
  /** @type {number} */
  @track showUndoButton;
  /** @type {string} */
  @track query;
  /** @type {boolean} */
  @track hasBreadcrumbs;

  /** @type {SearchStatus} */
  searchStatus;
  /** @type {HistoryManager} */
  historyManager;
  /** @type {QuerySummary} */
  querySummary;
  /** @type {BreadcrumbManager} */
  breadcrumbManager;
  /** @type {Function} */
  unsubscribeSearchStatus;
  /** @type {Function} */
  unsubscribeHistoryManager;
  /** @type {Function} */
  unsubscribeQuerySummary;
  /** @type {Function} */
  unsubscribeBreadcrumbsManager;
  /** @type {import('c/quanticUtils').AriaLiveUtils} */
  noResultAriaMessage;
  /** @type {boolean} */
  hasInitializationError = false;

  labels = {
    noResultsTitle,
    noResultsForTitle,
    noResultsWithFilters,
    noResultsWithoutFilters,
    undoLastAction,
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
    this.searchStatus = this.headless.buildSearchStatus(engine);
    this.querySummary = this.headless.buildQuerySummary(engine);
    this.breadcrumbManager = this.headless.buildBreadcrumbManager(engine);
    this.noResultAriaMessage = AriaLiveRegion('noresult', this);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );
    this.unsubscribeQuerySummary = this.querySummary.subscribe(() =>
      this.updateState()
    );
    this.unsubscribeBreadcrumbsManager = this.breadcrumbManager.subscribe(() =>
      this.updateState()
    );
    if (!this.disableCancelLastAction) {
      this.historyManager = this.headless.buildHistoryManager(engine);
      this.unsubscribeHistoryManager = this.historyManager.subscribe(() =>
        this.updateState()
      );
    }
  };

  disconnectedCallback() {
    this.unsubscribeSearchStatus?.();
    this.unsubscribeHistoryManager?.();
    this.unsubscribeQuerySummary?.();
    this.unsubscribeBreadcrumbsManager?.();
  }

  updateState() {
    this.showNoResultsPanel =
      this.searchStatus.state.firstSearchExecuted &&
      !this.searchStatus.state.isLoading &&
      !this.searchStatus.state.hasResults &&
      !this.searchStatus.state.hasError;
    if (this.showNoResultsPanel) {
      this.updateAriaMessage();
    }
    this.showUndoButton =
      !this.disableCancelLastAction && this.historyManager?.state.past.length;
    this.query = this.querySummary.state.hasQuery
      ? this.querySummary.state.query
      : '';
    this.hasBreadcrumbs = this.breadcrumbManager.state.hasBreadcrumbs;
  }

  updateAriaMessage() {
    this.noResultAriaMessage.dispatchMessage(
      this.query
        ? I18nUtils.format(this.labels.noResultsForTitle, this.query)
        : this.labels.noResultsTitle
    );
  }

  onUndoLastActionClick() {
    this.historyManager.back();
  }

  get noResultsTitleLabel() {
    if (this.query) {
      return I18nUtils.format(
        this.labels.noResultsForTitle,
        I18nUtils.getTextBold(I18nUtils.escapeHTML(this.query))
      );
    }
    return this.labels.noResultsTitle;
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
