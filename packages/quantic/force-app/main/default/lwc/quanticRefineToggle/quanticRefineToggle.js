import { LightningElement, api } from 'lwc';
import {
  initializeWithHeadless,
  registerComponentForInit,
} from 'c/quanticHeadlessLoader';
import LOCALE from '@salesforce/i18n/locale';
import sortAndFilters from '@salesforce/label/c.quantic_SortAndFilters';
import viewResults from '@salesforce/label/c.quantic_ViewResults';

/**
 * @typedef {Object} QuanticModalElement
 * @method openModal
 * @method closeModal
 */

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").QuerySummary} QuerySummary */
/** @typedef {import("coveo").BreadcrumbManager} BreadcrumbManager */

/**
 * The `QuanticRefineToggle` component displays a button that is used to open the refine modal.
 * @category Search
 * @example
 * <c-quantic-refine-toggle engine-id={engineId} hide-icon button-label="Custom label" hide-sort full-screen>
 *   <div slot="refine-title">Custom Title</div>
 * </c-quantic-refine-toggle>
 */
export default class QuanticRefineToggle extends LightningElement {
  labels = {
    sortAndFilters,
    viewResults,
  };

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * Indicates whether the icon of the refine toggle button should be hidden.
   * @api
   * @type {string}
   */
  @api hideIcon;
  /**
   * The label to be shown in the refine toggle button.
   * @api
   * @type {string}
   * @defaultValue `'Sort & Filters'`
   */
  @api buttonLabel = this.labels.sortAndFilters;
  /**
   * Indicates whether the Quantic Sort component should be hidden.
   * @api
   * @type {boolean}
   */
  @api hideSort;
  /**
   * Indicates whether the refine modal will be opened in full screen.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api fullScreen = false;

  /** @type {QuerySummary} */
  querySummary;
  /** @type {BreadcrumbManager} */
  breadcrumbManager;
  /** @type {number} */
  total;
  /** @type {number} */
  activeFiltersCount = 0;
  /** @type {string} */
  modalId = 'refineModal';

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
    this.breadcrumbManager = CoveoHeadless.buildBreadcrumbManager(engine);

    this.unsubscribeQuerySummary = this.querySummary.subscribe(() =>
      this.updateTotalResults()
    );
    this.unsubscribeBreadcrumbManager = this.breadcrumbManager.subscribe(() =>
      this.updateActiveFiltersCount()
    );
  };

  disconnectedCallback() {
    this.unsubscribeQuerySummary?.();
    this.unsubscribeBreadcrumbManager?.();
  }

  /**
   * Updates total number of results.
   * @returns {void}
   */
  updateTotalResults() {
    this.total = this.querySummary.state.total;
  }

  /**
   * Updates the number of active filters.
   * @returns {void}
   */
  updateActiveFiltersCount() {
    this.activeFiltersCount = this.breadcrumbManager.state.hasBreadcrumbs
      ? this.getFiltersCountFromAllBreadcrumbs()
      : 0;
  }

  /**
   * Returns the number of active filters from all the breadcrumbs.
   * @returns {number}
   */
  getFiltersCountFromAllBreadcrumbs() {
    const facetBreadcrumbKeys = [
      'facetBreadcrumbs',
      'numericFacetBreadcrumbs',
      'categoryFacetBreadcrumbs',
      'dateFacetBreadcrumbs',
      'staticFilterBreadcrumbs',
    ];
    return facetBreadcrumbKeys.reduce(
      (count, facetKey) =>
        count +
        this.getFiltersCountFromFacetBreadcrumb(
          this.breadcrumbManager.state[facetKey]
        ),
      0
    );
  }

  /**
   *  Returns the number of active filters from a specific facet breadcrumb.
   * @param {Array<{values: Array}>} facetBreadcrumb
   */
  getFiltersCountFromFacetBreadcrumb(facetBreadcrumb) {
    return facetBreadcrumb.reduce(
      (count, facet) => count + facet.values.length,
      0
    );
  }

  /**
   * Opens the refine modal.
   * @returns {void}
   */
  openModal() {
    /** @type {QuanticModalElement} */
    const modal = this.template.querySelector(`[data-id=${this.modalId}]`);
    modal.openModal();
  }

  /**
   * Closes the refine modal.
   * @returns {void}
   *
   */
  closeModal() {
    /** @type {QuanticModalElement} */
    const modal = this.template.querySelector(`[data-id=${this.modalId}]`);
    modal.closeModal();
  }

  /**
   * Returns view results label.
   * @returns {string}
   */
  get viewResultsLabel() {
    return `${this.labels.viewResults} (${new Intl.NumberFormat(LOCALE).format(
      this.total
    )})`;
  }

  /**
   * Returns the CSS class of the icon of the refine button.
   * @returns {string}
   */
  get buttonIconClass() {
    return [
      'slds-current-color',
      'slds-var-p-vertical_x-small',
      this.buttonLabel && 'slds-button__icon_right',
    ].join(' ');
  }

  /**
   * Indicates whether the refine button has a label.
   * @returns {boolean}
   */
  get hasButtonLabel() {
    return !!this.buttonLabel;
  }
}
