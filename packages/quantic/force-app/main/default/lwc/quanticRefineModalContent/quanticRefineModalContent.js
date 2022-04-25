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

const CUMMON_FACET_PROPERTIES = ['facetId', 'field', 'label'];
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
 * The `QuanticRefineModalContent` component duplicates and displays the facets present in the search interface in addition to the sort component. This components is primarly made to be displayed inside a modal to assure the responsivness when the search interface is displayed in smaller screens.
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
    if (!this.facetsAreAvailable) {
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
   * Returns facet data.
   * @returns {Array<object>}
   */
  get facets() {
    if (!this.data) {
      return [];
    }
    const facetData = Object.keys(this.data).map((facetId) => {
      if (this.data[facetId].element.localName === 'c-quantic-numeric-facet') {
        return {
          isNumeric: true,
          ...this.extractFacetDataFromElement(
            this.data[facetId].element,
            CUMMON_FACET_PROPERTIES
          ),
          ...this.extractFacetDataFromElement(
            this.data[facetId].element,
            NUMERIC_FACET_PROPERTIES
          ),
        };
      } else if (this.data[facetId].element.localName === 'c-quantic-facet') {
        return {
          isDefault: true,
          ...this.extractFacetDataFromElement(
            this.data[facetId].element,
            CUMMON_FACET_PROPERTIES
          ),
          ...this.extractFacetDataFromElement(
            this.data[facetId].element,
            DEFAULT_FACET_PROPERTIES
          ),
        };
      } else if (
        this.data[facetId].element.localName === 'c-quantic-category-facet'
      ) {
        return {
          isCategory: true,
          ...this.extractFacetDataFromElement(
            this.data[facetId].element,
            CUMMON_FACET_PROPERTIES
          ),
          ...this.extractFacetDataFromElement(
            this.data[facetId].element,
            CATEGORY_FACET_PROPERTIES
          ),
        };
      } else if (
        this.data[facetId].element.localName === 'c-quantic-timeframe-facet'
      ) {
        return {
          isTimeframe: true,
          ...this.extractFacetDataFromElement(
            this.data[facetId].element,
            CUMMON_FACET_PROPERTIES
          ),
          ...this.extractFacetDataFromElement(
            this.data[facetId].element,
            TIMEFRAME_FACET_PROPERTIES
          ),
        };
      }
      return null;
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
    const data = {};
    properties.forEach((property) => {
      data[property] = element[property];
    });
    return data;
  }

  get facetsAreAvailable() {
    return this.data && Object.keys(this.data).length;
  }
}
