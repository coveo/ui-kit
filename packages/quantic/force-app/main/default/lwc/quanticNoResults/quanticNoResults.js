import {api, LightningElement, track} from 'lwc';
import {initializeWithHeadless, registerComponentForInit} from 'c/quanticHeadlessLoader';
import {I18nUtils} from 'c/quanticUtils';

import noResultsForTitle from '@salesforce/label/c.quantic_NoResultsForTitle';
import noResultsTitle from '@salesforce/label/c.quantic_NoResultsTitle';
import noResultsWithFilters from '@salesforce/label/c.quantic_NoResultsWithFilters';
import noResultsWithoutFilters from '@salesforce/label/c.quantic_NoResultsWithoutFilters';
import undoLastAction from '@salesforce/label/c.quantic_UndoLastAction';

export default class QuanticNoResults extends LightningElement {
  /** @type {string}*/
  @api engineId;

  /** @type {import("coveo").SearchStatus} */
  searchStatus;

  /** @type {import("coveo").HistoryManager} */
  historyManager;

  /** @type {import("coveo").QuerySummary} */
  querySummary;

  /** @type {import("coveo").BreadcrumbManager} */
  breadcrumbManager;

  labels = {
    noResultsTitle,
    noResultsForTitle,
    noResultsWithFilters,
    noResultsWithoutFilters,
    undoLastAction
  }

  /** @type {() => void} */
  unsubscribeSearchStatus;
  /** @type {() => void} */
  unsubscribeHistoryManager;
  /** @type {() => void} */
  unsubscribeQuerySummary;
  /** @type {() => void} */
  unsubscribeBreadcrumbsManager;
  /**
   * @type {boolean}
   */
  @api disableCancelLastAction

  /**
   * @type {boolean}
   */
  @track showNoResultsPanel;

  /**
   * @type {number}
   */
  @track showUndoButton;

  /**
   * @type {string}
   */
  @track query;
  /**
   * @type {boolean}
   */
  @track hasBreadcrumbs

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
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.historyManager = CoveoHeadless.buildHistoryManager(engine);
    this.querySummary = CoveoHeadless.buildQuerySummary(engine);
    this.breadcrumbManager = CoveoHeadless.buildBreadcrumbManager(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => this.updateState());
    this.unsubscribeHistoryManager = this.historyManager.subscribe(() => this.updateState());
    this.unsubscribeQuerySummary = this.querySummary.subscribe(() => this.updateState());
    this.unsubscribeBreadcrumbsManager = this.breadcrumbManager.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribeSearchStatus?.();
    this.unsubscribeHistoryManager?.();
    this.unsubscribeQuerySummary?.();
    this.unsubscribeBreadcrumbsManager?.();
  }
  updateState() {
    this.showNoResultsPanel = this.searchStatus.state.firstSearchExecuted && !this.searchStatus.state.isLoading && !this.searchStatus.state.hasResults && !this.searchStatus.state.hasError;
    this.showUndoButton = !this.disableCancelLastAction && this.historyManager.state.past.length;
    this.query = this.querySummary.state.hasQuery ? this.querySummary.state.query : "";
    this.hasBreadcrumbs = this.breadcrumbManager.state.hasBreadcrumbs;
  }

  onUndoLastActionClick() {
    this.historyManager.back();
  }

  get noResultsTitleLabel() {
    if (this.query) {
      return I18nUtils.format(this.labels.noResultsForTitle, I18nUtils.getTextBold(this.query));
    }
    return this.labels.noResultsTitle;
  }
}