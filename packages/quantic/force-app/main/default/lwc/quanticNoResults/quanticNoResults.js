import { api, LightningElement, track } from 'lwc';
import { initializeWithHeadless, registerComponentForInit } from 'c/quanticHeadlessLoader';
import { I18nUtils } from 'c/quanticUtils';

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

    labels = {
        noResultsTitle,
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
    /**
     * @type {boolean}
     */
    @api enableCancelLastAction

    /**
     * @type {boolean}
     */
    @api enableSearchTips

    /**
     * @type {boolean}
     */
    @track hasResults;

    /**
     * @type {number}
     */
    @track hasHistory;

    /**
     * @type {string}
     */
    @track query;

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
        this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => this.updateState());
        this.unsubscribeHistoryManager = this.historyManager.subscribe(() => this.updateState());
        this.unsubscribeQuerySummary = this.querySummary.subscribe(() => this.updateState());
    }

    disconnectedCallback() {
        if (this.unsubscribeSearchStatus) {
          this.unsubscribeSearchStatus();
        }
        if(this.unsubscribeHistoryManager) {
            this.unsubscribeHistoryManager();
        }
        if(this.unsubscribeQuerySummary) {
            this.unsubscribeQuerySummary();
        }
    }
    updateState() {
        this.hasResults = !this.searchStatus.state.firstSearchExecuted ||this.searchStatus.state.isLoading || this.searchStatus.state.hasResults;
        this.hasHistory = this.historyManager.state.past.length;
        this.query = this.querySummary.state.hasQuery ? this.querySummary.state.query : "";
    }

    onUndoLastActionClick() {
        this.historyManager.back();
    }

    get noResultsTitleLabel() {
        return I18nUtils.format(this.labels.noResultsTitle, I18nUtils.getTextBold(this.query));
    }
}