import {LightningElement, api} from 'lwc';
import {
  getHeadlessBundle,
  initializeWithHeadless,
  registerComponentForInit,
  getAllFacetsFromStore,
} from 'c/quanticHeadlessLoader';
import LOCALE from '@salesforce/i18n/locale';
import sortAndFilters from '@salesforce/label/c.quantic_SortAndFilters';
import viewResults from '@salesforce/label/c.quantic_ViewResults';
import noFiltersAvailableForThisQuery from '@salesforce/label/c.quantic_NoFiltersAvailableForThisQuery';
import noFilterForCurrentTab from '@salesforce/label/c.quantic_NoFilterForCurrentTab';

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
 * @category Insight Panel
 * @example
 * <c-quantic-refine-toggle engine-id={engineId} hide-sort full-screen title="Filters">
 *   <div slot="refine-title">Custom Title</div>
 *   <div slot="button-content">
 *     Custom Label
 *     <lightning-icon size="x-small" icon-name="utility:filterList" alternative-text="Filters"
 *       class="custom-refine-icon slds-current-color slds-var-p-vertical_x-small slds-button__icon_right">
 *     </lightning-icon>
 *   </div>
 * </c-quantic-refine-toggle>
 */
export default class QuanticRefineToggle extends LightningElement {
  labels = {
    sortAndFilters,
    viewResults,
    noFiltersAvailableForThisQuery,
    noFilterForCurrentTab,
  };

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
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
  /**
   * The title of the toggle button.
   * @api
   * @type {string}
   */
  @api title = this.labels.sortAndFilters;

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
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  hasResults;

  renderedFacets = {};

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.addEventListener('renderFacet', this.handleRenderFacetEvent);
  }

  /**
   * @param {CustomEvent} event
   */
  handleRenderFacetEvent = (event) => {
    this.renderedFacets[event.detail.id] = event.detail.shouldRenderFacet;
  };

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.querySummary = this.headless.buildQuerySummary(engine);
    this.breadcrumbManager = this.headless.buildBreadcrumbManager(engine);
    this.searchStatus = this.headless.buildSearchStatus(engine);

    this.unsubscribeQuerySummary = this.querySummary.subscribe(() =>
      this.updateTotalResults()
    );
    this.unsubscribeBreadcrumbManager = this.breadcrumbManager.subscribe(() =>
      this.updateActiveFiltersCount()
    );
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateHasResults()
    );

    const registeredFacets = getAllFacetsFromStore(this.engineId);
    Object.keys(registeredFacets).forEach((facetId) => {
      this.renderedFacets[facetId] = true;
    });
  };

  get refineButtonDisabled() {
    const noResults = !this.hasResults;
    const noFacetsSelected = !this.activeFiltersCount;
    return (noResults && noFacetsSelected) || this.isContentEmpty;
  }

  get someFacetsRendered() {
    return Object.values(this.renderedFacets).reduce(
      (result, facetRendered) => result || facetRendered,
      false
    );
  }

  disconnectedCallback() {
    this.unsubscribeQuerySummary?.();
    this.unsubscribeBreadcrumbManager?.();
    this.unsubscribeSearchStatus?.();
    this.removeEventListener('renderFacet', this.handleRenderFacetEvent);
  }

  get isContentEmpty() {
    return this.hideSort && !this.someFacetsRendered;
  }

  /**
   * Updates total number of results.
   * @returns {void}
   */
  updateTotalResults() {
    this.total = this.querySummary.state.total;
  }

  /**
   * Updates the value of the hasResults.
   * @returns {void}
   */
  updateHasResults() {
    this.hasResults = this.searchStatus?.state?.hasResults;
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
      'dateFacetBreadcrumbs',
      'staticFilterBreadcrumbs',
    ];
    let total = facetBreadcrumbKeys.reduce(
      (count, facetKey) =>
        count +
        this.getFiltersCountFromFacetBreadcrumb(
          this.breadcrumbManager?.state?.[facetKey]
        ),
      0
    );
    const categoryFacetBreadcrumbKey = 'categoryFacetBreadcrumbs';
    total += this.getFiltersCountFromCategoryFacetBreadcrumb(
      this.breadcrumbManager?.state?.[categoryFacetBreadcrumbKey]
    );
    return total;
  }

  /**
   *  Returns the number of active filters from a specific facet breadcrumb.
   * @param {Array<{values: Array}>} facetBreadcrumb
   */
  getFiltersCountFromFacetBreadcrumb(facetBreadcrumb) {
    if (!facetBreadcrumb) {
      return 0;
    }
    return facetBreadcrumb.reduce(
      (count, facet) => count + (facet?.values?.length || 0),
      0
    );
  }

  /**
   * Returns the number of active filters from a specific facet breadcrumb.
   * @param {Array<{path: Array}>} facetBreadcrumb
   */
  getFiltersCountFromCategoryFacetBreadcrumb(facetBreadcrumb) {
    if (!facetBreadcrumb) {
      return 0;
    }
    return facetBreadcrumb.reduce(
      (count, facet) => count + (facet?.path?.length ? 1 : 0),
      0
    );
  }

  /**
   * Returns the Quantic Modal element.
   * @returns {HTMLElement}
   */
  getModal() {
    return this.template.querySelector(`[data-id=${this.modalId}]`);
  }

  /**
   * Opens the refine modal.
   * @returns {void}
   */
  openModal() {
    /** @type {QuanticModalElement} */
    const modal = this.getModal();
    modal.openModal();
  }

  /**
   * Closes the refine modal.
   * @returns {void}
   */
  closeModal() {
    /** @type {QuanticModalElement} */
    const modal = this.getModal();
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
   * Returns the title of the refine toggle.
   * @returns {string}
   */
  get buttonTitle() {
    return this.refineButtonDisabled
      ? this.labels.noFiltersAvailableForThisQuery
      : this.title;
  }
}
