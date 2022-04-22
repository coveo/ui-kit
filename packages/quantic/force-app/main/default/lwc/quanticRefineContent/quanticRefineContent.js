import { LightningElement, api } from 'lwc';
import {
  getAllFacetsFromStore
} from 'c/quanticHeadlessLoader';
import {
  initializeWithHeadless,
  registerComponentForInit,
} from 'c/quanticHeadlessLoader';

/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").BreadcrumbManager} BreadcrumbManager */
/** @typedef {import("coveo").QuerySummary} QuerySummary */


const CUMMON_FACET_PROPERTIES = ["facetId", "field", "label"];
const DEFAULT_FACET_PROPERTIES = ["numberOfValues", "sortCriteria", "noSearch", "displayValuesAs", "noFilterFacetCount", "injectionDepth"];
const NUMERIC_FACET_PROPERTIES = ["numberOfValues", "sortCriteria", "rangeAlgorithm", "withInput", "formattingFunction"];
const CATEGORY_FACET_PROPERTIES = ["basePath", "noFilterByBasePath", "noFilterFacetCount", "delimitingCharacter", "numberOfValues", "sortCriteria", "withSearch"]
const TIMEFRAME_FACET_PROPERTIES = ["withDatePicker", "noFilterFacetCount", "injectionDepth"]


export default class QuanticRefineContent extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * whether the Quantic Sort component should be displayed.
   * @api
   * @type {boolean}
   */
  @api showSort;

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
      this.updateSearchStatusState()
    );
  };

  updateSearchStatusState() {
    if (!this.showFacets) {
      const venou = getAllFacetsFromStore(this.engineId)
      console.log('test recieved')
      console.log(venou)
      this.data = venou;
    }
  }

  clearAllFilters() {
    this.breadcrumbManager.deselectAll();
  }


  get facets() {
    if (!this.data) {
      return []
    }
    const facetData = Object.keys(this.data).map((facetId) => {
      if (this.data[facetId].element.localName === 'c-quantic-numeric-facet') {
        return {
          isNumeric: true,
          ...this.extractFacetDataFromElement(this.data[facetId].element, CUMMON_FACET_PROPERTIES),
          ...this.extractFacetDataFromElement(this.data[facetId].element, NUMERIC_FACET_PROPERTIES)
        }
      } else if (this.data[facetId].element.localName === 'c-quantic-facet') {
        return {
          isDefault: true,
          ...this.extractFacetDataFromElement(this.data[facetId].element, CUMMON_FACET_PROPERTIES),
          ...this.extractFacetDataFromElement(this.data[facetId].element, DEFAULT_FACET_PROPERTIES)
        }
      } else if (this.data[facetId].element.localName === 'c-quantic-category-facet') {
        return {
          isCategory: true,
          ...this.extractFacetDataFromElement(this.data[facetId].element, CUMMON_FACET_PROPERTIES),
          ...this.extractFacetDataFromElement(this.data[facetId].element, CATEGORY_FACET_PROPERTIES)
        }
      } else if (this.data[facetId].element.localName === 'c-quantic-timeframe-facet') {
        return {
          isTimeframe: true,
          ...this.extractFacetDataFromElement(this.data[facetId].element, CUMMON_FACET_PROPERTIES),
          ...this.extractFacetDataFromElement(this.data[facetId].element, TIMEFRAME_FACET_PROPERTIES)
        }
      }
      return null
    })

    return facetData
  }

  extractFacetDataFromElement(element, properties) {
    const data = {}
    properties.forEach(property => {
      data[property] = element[property]
    })
    return data;
  }

  get showFacets() {
    return this.data && Object.keys(this.data).length;
  }
}