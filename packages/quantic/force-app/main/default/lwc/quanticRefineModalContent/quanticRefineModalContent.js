import {LightningElement, api} from 'lwc';
import {getAllFacetsFromStore} from 'c/quanticHeadlessLoader';
import {
  initializeWithHeadless,
  registerComponentForInit,
} from 'c/quanticHeadlessLoader';
import filters from '@salesforce/label/c.quantic_Filters';
import clearAllFilters from '@salesforce/label/c.quantic_ClearAllFilters';

/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").BreadcrumbManager} BreadcrumbManager */

const COMMON_FACET_PROPERTIES = ['facetId', 'field', 'label'];
const DEFAULT_FACET_PROPERTIES = [
  'numberOfValues',
  'sortCriteria',
  'noSearch',
  'displayValuesAs',
  'noFilterFacetCount',
  'injectionDepth',
];
const NUMERIC_FACET_PROPERTIES = [
  'numberOfValues',
  'sortCriteria',
  'rangeAlgorithm',
  'withInput',
  'formattingFunction',
];
const CATEGORY_FACET_PROPERTIES = [
  'basePath',
  'noFilterByBasePath',
  'noFilterFacetCount',
  'delimitingCharacter',
  'numberOfValues',
  'sortCriteria',
  'withSearch',
];
const TIMEFRAME_FACET_PROPERTIES = [
  'withDatePicker',
  'noFilterFacetCount',
  'injectionDepth',
];
const DATE_FACET_PROPERTIES = ['numberOfValues', 'formattingFunction'];

/**
 * The `QuanticRefineModalContent` component displays a copy of the search interface facets and sort components. This component is intended to be displayed inside the Quantic Modal to assure the responsiveness when the search interface is displayed on smaller screens.
 *
 * @category Search
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

  /**@type {object} */
  data;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  disconnectedCallback() {
    this.unsubscribeSearchStatus?.();
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.breadcrumbManager = CoveoHeadless.buildBreadcrumbManager(engine);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.gatherFacets()
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
   * Deselects all the filters.
   * @returns {void}
   */
  clearAllFilters() {
    this.breadcrumbManager.deselectAll();
  }

  /**
   * Returns the data needed to create a copy of the numeric facet.
   * @param {HTMLElement} facetElement
   * @returns {object}
   */
  toNumericFacet = (facetElement) => {
    return {
      isNumeric: true,
      ...this.extractFacetDataFromElement(facetElement, [
        ...COMMON_FACET_PROPERTIES,
        ...NUMERIC_FACET_PROPERTIES,
      ]),
    };
  };

  /**
   * Returns the data needed to create a copy of the default facet.
   * @param {HTMLElement} facetElement
   * @returns {object}
   */
  toDefaultFacet = (facetElement) => {
    return {
      isDefault: true,
      ...this.extractFacetDataFromElement(facetElement, [
        ...COMMON_FACET_PROPERTIES,
        ...DEFAULT_FACET_PROPERTIES,
      ]),
    };
  };

  /**
   * Returns the data needed to create a copy of the category facet.
   * @param {HTMLElement} facetElement
   * @returns {object}
   */
  toCategoryFacet = (facetElement) => {
    return {
      isCategory: true,
      ...this.extractFacetDataFromElement(facetElement, [
        ...COMMON_FACET_PROPERTIES,
        ...CATEGORY_FACET_PROPERTIES,
      ]),
    };
  };

  /**
   * Returns the data needed to create a copy of the timeframe facet.
   * @param {HTMLElement} facetElement
   * @returns {object}
   */
  toTimeframeFacet = (facetElement) => {
    return {
      isTimeframe: true,
      ...this.extractFacetDataFromElement(facetElement, [
        ...COMMON_FACET_PROPERTIES,
        ...TIMEFRAME_FACET_PROPERTIES,
      ]),
    };
  };

  /**
   * Returns the data needed to create a copy of the date facet.
   * @param {HTMLElement} facetElement
   * @returns {object}
   */
  toDateFacet = (facetElement) => {
    return {
      isDate: true,
      ...this.extractFacetDataFromElement(facetElement, [
        ...COMMON_FACET_PROPERTIES,
        ...DATE_FACET_PROPERTIES,
      ]),
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
      const facetElement = this.data[facetId].element;
      const selector = this.selectors[facetElement.localName];
      return selector ? selector(facetElement) : null;
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
