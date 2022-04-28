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

/**
 * The `QuanticRefineModalContent` component displays a copy of the search interface facets and sort components. This component is intended to be displayed inside a modal to assure the responsiveness when the search interface is displayed on smaller screens.
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
   * Gather all facets registred from the Quantic store.
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

  toNumericFacet(facetElement) {
    return {
      isNumeric: true,
      ...QuanticRefineModalContent.extractFacetDataFromElement(facetElement, [
        ...COMMON_FACET_PROPERTIES,
        ...NUMERIC_FACET_PROPERTIES,
      ]),
    };
  }

  toDefaultFacet(facetElement) {
    return {
      isDefault: true,
      ...QuanticRefineModalContent.extractFacetDataFromElement(facetElement, [
        ...COMMON_FACET_PROPERTIES,
        ...DEFAULT_FACET_PROPERTIES,
      ]),
    };
  }

  toCategoryFacet(facetElement) {
    return {
      isCategory: true,
      ...QuanticRefineModalContent.extractFacetDataFromElement(facetElement, [
        ...COMMON_FACET_PROPERTIES,
        ...CATEGORY_FACET_PROPERTIES,
      ]),
    };
  }

  toTimeframeFacet(facetElement) {
    return {
      isTimeframe: true,
      ...QuanticRefineModalContent.extractFacetDataFromElement(facetElement, [
        ...COMMON_FACET_PROPERTIES,
        ...TIMEFRAME_FACET_PROPERTIES,
      ]),
    };
  }

  selectors = {
    'c-quantic-numeric-facet': this.toNumericFacet,
    'c-quantic-category-facet': this.toCategoryFacet,
    'c-quantic-timeframe-facet': this.toTimeframeFacet,
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
  static extractFacetDataFromElement(element, properties) {
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
