import clearAllFilters from '@salesforce/label/c.quantic_ClearAllFilters';
import filters from '@salesforce/label/c.quantic_Filters';
import QuanticCategoryFacet from 'c/quanticCategoryFacet';
import QuanticDateFacet from 'c/quanticDateFacet';
import QuanticFacet from 'c/quanticFacet';
import {
  getAllFacetsFromStore,
  getAllSortOptionsFromStore,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {
  initializeWithHeadless,
  registerComponentForInit,
} from 'c/quanticHeadlessLoader';
import QuanticNumericFacet from 'c/quanticNumericFacet';
import QuanticTimeframeFacet from 'c/quanticTimeframeFacet';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import disabledDynamicNavigationTemplate from './templates/disabledDynamicNavigation.html';
// @ts-ignore
import enabledDynamicNavigationTemplate from './templates/dynamicNavigation.html';

/** @typedef {import("coveo").SortCriterion} SortCriterion */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").BreadcrumbManager} BreadcrumbManager */

/**
 * @typedef {Object} FacetObject
 * @property {HTMLElement} element - The HTML element of the facet.
 * @property {function} [format] - The formatting function of the facet.
 * @property {object} [metadata] - Metadata of the facet.
 */

/**
 * @typedef {Object} SortOption
 * @property {string} label
 * @property {string} value
 * @property {SortCriterion} criterion
 */

/**
 * The `QuanticRefineModalContent` component displays a copy of the search interface facets and sort components. This component is intended to be displayed inside the Quantic Modal to assure the responsiveness when the search interface is displayed on smaller screens.
 *
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-refine-modal-content engine-id={engineId} hide-sort disable-dynamic-navigation></c-quantic-refine-modal-content>
 */
export default class QuanticRefineModalContent extends LightningElement {
  labels = {
    filters,
    clearAllFilters,
  };

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * Whether the Quantic Sort component should be hidden.
   * @api
   * @type {boolean}
   */
  @api hideSort;
  /**
   * Indicates whether to disable the dynamic navigation feature according to [the dynamic navigation experience](https://docs.coveo.com/en/3383/leverage-machine-learning/about-dynamic-navigation-experience-dne).
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api disableDynamicNavigation = false;

  /** @type {object} */
  facetData;
  /** @type {boolean} */
  isSortComponentReady = false;
  /** @type {object} */
  sortData;
  /** @type {boolean} */
  hasActiveFilters = false;
  /** @type {AnyHeadless} */
  headless;
  /** @type {object} */
  renderedFacets = {};
  /** @type {boolean} */
  someFacetsRendered = false;
  /** @type {boolean} */
  hasInitializationError = false;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.addEventListener('quantic__renderfacet', this.handleRenderFacetEvent);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  disconnectedCallback() {
    this.unsubscribeSearchStatus?.();
    this.unsubscribeBreadcrumbManager?.();
    this.removeEventListener(
      'quantic__renderfacet',
      this.handleRenderFacetEvent
    );
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.searchStatus = this.headless.buildSearchStatus(engine);
    this.breadcrumbManager = this.headless.buildBreadcrumbManager(engine);
    this.getSortOptionsFromStore();

    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.getFacetDataFromStore()
    );
    this.unsubscribeBreadcrumbManager = this.breadcrumbManager.subscribe(() =>
      this.updateHasActiveFilters()
    );
  };

  /**
   * Initializes all facets registered in the Quantic store.
   * @returns {void}
   */
  getFacetDataFromStore() {
    if (!this.hasFacets) {
      this.facetData = getAllFacetsFromStore(this.engineId);
    }
  }

  /**
   * Initializes all sort options registered in the Quantic store.
   * @returns {void}
   */
  getSortOptionsFromStore() {
    this.sortData = getAllSortOptionsFromStore(this.engineId);
    this.isSortComponentReady = true;
  }

  /**
   * Updates the hasActiveFilters property.
   * @returns {void}
   */
  updateHasActiveFilters() {
    this.hasActiveFilters = this.breadcrumbManager.state.hasBreadcrumbs;
  }

  /**
   * Deselects all the filters.
   * @returns {void}
   */
  clearAllFilters() {
    this.breadcrumbManager.deselectAll();
  }

  /**
   * Returns the data needed to create a copy of the numeric facet.
   * @param {FacetObject} facetObject
   * @returns {object}
   */
  toNumericFacet = (facetObject) => {
    return {
      isNumeric: true,
      ...this.extractFacetDataFromElement(
        facetObject.element,
        QuanticNumericFacet.attributes
      ),
      formattingFunction: facetObject.format,
    };
  };

  /**
   * Returns the data needed to create a copy of the default facet.
   * @param {FacetObject} facetObject
   * @returns {object}
   */
  toDefaultFacet = (facetObject) => {
    return {
      isDefault: true,
      customCaptions: facetObject.metadata?.customCaptions?.map?.(
        (caption, index) => ({
          ...caption,
          index,
        })
      ),
      ...this.extractFacetDataFromElement(
        facetObject.element,
        QuanticFacet.attributes
      ),
    };
  };

  /**
   * Returns the data needed to create a copy of the category facet.
   * @param {FacetObject} facetObject
   * @returns {object}
   */
  toCategoryFacet = (facetObject) => {
    return {
      isCategory: true,
      customCaptions: facetObject.metadata?.customCaptions?.map?.(
        (caption, index) => ({
          ...caption,
          index,
        })
      ),
      ...this.extractFacetDataFromElement(
        facetObject.element,
        QuanticCategoryFacet.attributes
      ),
    };
  };

  /**
   * Returns the data needed to create a copy of the timeframe facet.
   * @param {FacetObject} facetObject
   * @returns {object}
   */
  toTimeframeFacet = (facetObject) => {
    return {
      isTimeframe: true,
      timeframes: facetObject.metadata.timeframes.map((timeframe, index) => ({
        ...timeframe,
        index,
      })),
      ...this.extractFacetDataFromElement(
        facetObject.element,
        QuanticTimeframeFacet.attributes
      ),
    };
  };

  /**
   * Returns the data needed to create a copy of the date facet.
   * @param {FacetObject} facetObject
   * @returns {object}
   */
  toDateFacet = (facetObject) => {
    return {
      isDate: true,
      ...this.extractFacetDataFromElement(
        facetObject.element,
        QuanticDateFacet.attributes
      ),
      formattingFunction: facetObject.format,
    };
  };

  selectors = {
    'c-quantic-numeric-facet': this.toNumericFacet,
    'c-quantic-category-facet': this.toCategoryFacet,
    'c-quantic-timeframe-facet': this.toTimeframeFacet,
    'c-quantic-date-facet': this.toDateFacet,
    'c-quantic-facet': this.toDefaultFacet,
  };

  /**
   * Returns facet data.
   * @returns {Array<object>}
   */
  get facets() {
    if (!this.facetData) {
      return [];
    }
    const facetData = Object.keys(this.facetData).map((facetId) => {
      /** @type {FacetObject} */
      const facetObject = this.facetData[facetId];
      const selector = this.selectors[facetObject.element.localName];
      return selector ? selector(facetObject) : null;
    });

    return facetData;
  }

  /**
   * Returns sort option data.
   * @returns {Array<SortOption>}
   */
  get sortOptions() {
    return this.sortData?.length > 0 ? this.sortData : [];
  }

  get shouldDisplayFiltersTitle() {
    return this.someFacetsRendered && !this.hideSort;
  }

  /**
   * Extracts properties of a given HTML element.
   * @param {HTMLElement} element
   * @param {Array<string>} properties
   * @returns {object}
   */
  extractFacetDataFromElement(element, properties) {
    return properties.reduce((data, property) => {
      data[property] = element[property];
      return data;
    }, {});
  }

  /**
   * Indicates whether the facets are available.
   * @returns {boolean}
   */
  get hasFacets() {
    return this.facetData && !!Object.keys(this.facetData).length;
  }

  /**
   * @param {CustomEvent} event
   */
  handleRenderFacetEvent = (event) => {
    this.renderedFacets[event.detail.id] = event.detail.shouldRenderFacet;
    this.someFacetsRendered = Object.values(this.renderedFacets).reduce(
      (result, facetRendered) => result || facetRendered,
      false
    );
  };

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  render() {
    if (this.disableDynamicNavigation) {
      return disabledDynamicNavigationTemplate;
    }
    return enabledDynamicNavigationTemplate;
  }
}
