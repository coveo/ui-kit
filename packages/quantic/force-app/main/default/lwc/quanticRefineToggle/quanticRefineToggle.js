import LOCALE from '@salesforce/i18n/locale';
import noFilterForCurrentTab from '@salesforce/label/c.quantic_NoFilterForCurrentTab';
import noFiltersAvailableForThisQuery from '@salesforce/label/c.quantic_NoFiltersAvailableForThisQuery';
import sortAndFilters from '@salesforce/label/c.quantic_SortAndFilters';
import viewResults from '@salesforce/label/c.quantic_ViewResults';
import {
  getHeadlessBundle,
  initializeWithHeadless,
  registerComponentForInit,
  getAllFacetsFromStore,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").QuerySummary} QuerySummary */
/** @typedef {import("coveo").BreadcrumbManager} BreadcrumbManager */

/**
 * @typedef {Object} QuanticModalElement
 * @property {function} openModal
 * @property {function} closeModal
 * @property {boolean} fullScreen
 */

/**
 * @typedef {Object} QuanticModalContentElement
 * @property {boolean} hideSort
 */

/**
 * The `QuanticRefineToggle` component displays a button that is used to open the refine modal.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-refine-toggle engine-id={engineId} hide-sort full-screen title="Filters" disable-dynamic-navigation>
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
  /**
   * Indicates whether to disable the dynamic navigation feature according to [the dynamic navigation experience](https://docs.coveo.com/en/3383/leverage-machine-learning/about-dynamic-navigation-experience-dne).
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api disableDynamicNavigation = false;

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
  /** @type {boolean} */
  modalIsOpen = false;
  /** @type {boolean} */
  hasInitializationError = false;

  renderedFacets = {};

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.addEventListener('quantic__renderfacet', this.handleRenderFacetEvent);
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
    this.removeEventListener(
      'quantic__renderfacet',
      this.handleRenderFacetEvent
    );
  }

  get isContentEmpty() {
    return !!this.hideSort && !this.someFacetsRendered;
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
   * @return {QuanticModalElement}
   */
  get modal() {
    /** @type {Object} */
    const modal = this.template.querySelector(`[data-id=${this.modalId}]`);
    return modal;
  }

  /**
   * Returns the Quantic Refine Modal Content element.
   * @return {QuanticModalContentElement}
   */
  get modalContent() {
    /** @type {Object} */
    const modalContent = this.template.querySelector(
      'c-quantic-refine-modal-content'
    );
    return modalContent;
  }

  /**
   * Opens the refine modal.
   * @returns {void}
   */
  openModal() {
    this.modal.openModal();
    this.sendRefineModalEvent(true);
    this.modalIsOpen = true;
  }

  /**
   * Closes the refine modal.
   * @returns {void}
   */
  closeModal() {
    this.modal.closeModal();
    this.sendRefineModalEvent(false);
    this.modalIsOpen = false;
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

  /**
   * Sends the "quantic__refinemodaltoggle" event.
   * @param {boolean} isOpen
   */
  sendRefineModalEvent(isOpen) {
    const refineModalEvent = new CustomEvent('quantic__refinemodaltoggle', {
      composed: true,
      bubbles: true,
      detail: {isOpen},
    });
    this.dispatchEvent(refineModalEvent);
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
