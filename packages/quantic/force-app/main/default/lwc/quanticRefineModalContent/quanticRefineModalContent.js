import {LightningElement, api} from 'lwc';
import {
  getAllFacetsFromStore,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {
  initializeWithHeadless,
  registerComponentForInit,
} from 'c/quanticHeadlessLoader';
import filters from '@salesforce/label/c.quantic_Filters';
import clearAllFilters from '@salesforce/label/c.quantic_ClearAllFilters';

import QuanticNumericFacet from 'c/quanticNumericFacet';
import QuanticFacet from 'c/quanticFacet';
import QuanticCategoryFacet from 'c/quanticCategoryFacet';
import QuanticDateFacet from 'c/quanticDateFacet';
import QuanticTimeframeFacet from 'c/quanticTimeframeFacet';

/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").BreadcrumbManager} BreadcrumbManager */

/**
 * @typedef {Object} FacetObject
 * @property {HTMLElement} element - The HTML element of the facet.
 * @property {function} [format] - The formatting function of the facet.
 */

/**
 * The `QuanticRefineModalContent` component displays a copy of the search interface facets and sort components. This component is intended to be displayed inside the Quantic Modal to assure the responsiveness when the search interface is displayed on smaller screens.
 *
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-refine-modal-content engine-id={engineId} hide-sort></c-quantic-refine-modal-content>
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

  /** @type {object} */
  data;
  /** @type {boolean} */
  hasActiveFilters = false;
  /** @type {AnyHeadless} */
  headless;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  disconnectedCallback() {
    this.unsubscribeSearchStatus?.();
    this.unsubscribeBreadcrumbManager?.();
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.searchStatus = this.headless.buildSearchStatus(engine);
    this.breadcrumbManager = this.headless.buildBreadcrumbManager(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.gatherFacets()
    );
    this.unsubscribeBreadcrumbManager = this.breadcrumbManager.subscribe(() =>
      this.updateHasActiveFilters()
    );
  };

  /**
   * Gather all facets registered in the Quantic store.
   * @returns {void}
   */
  gatherFacets() {
    if (!this.hasFacets) {
      this.data = getAllFacetsFromStore(this.engineId);
    }
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
    if (!this.data) {
      return [];
    }
    const facetData = Object.keys(this.data).map((facetId) => {
      /** @type {FacetObject} */
      const facetObject = this.data[facetId];
      const selector = this.selectors[facetObject.element.localName];
      return selector ? selector(facetObject) : null;
    });

    return facetData;
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
    return this.data && !!Object.keys(this.data).length;
  }
}
