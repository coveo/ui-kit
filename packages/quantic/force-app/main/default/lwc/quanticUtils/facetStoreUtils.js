/** @typedef {import("coveo").SortCriterion} SortCriterion */

/**
 * Utility class for managing a simple in-memory store.
 * Supports registering and retrieving facet and sort option data.
 */
export class Store {
  static facetTypes = {
    FACETS: 'facets',
    NUMERICFACETS: 'numericFacets',
    DATEFACETS: 'dateFacets',
    CATEGORYFACETS: 'categoryFacets',
  };
  static initialize() {
    return {
      state: {
        facets: {},
        numericFacets: {},
        dateFacets: {},
        categoryFacets: {},
        sort: {},
      },
    };
  }
  /**
   * Registers a facet to the store if it does not already exist.
   * @param {Record<String, unknown>} store
   * @param {string} facetType
   * @param {{ label?: string; facetId: any; format?: Function;}} data
   */
  static registerFacetToStore(store, facetType, data) {
    if (store?.state[facetType][data.facetId]) {
      return;
    }
    store.state[facetType][data.facetId] = data;
  }

  /**
   * Registers sort option data to the store.
   * @param {Record<String, any>} store
   * @param {Array<{label: string; value: string; criterion: SortCriterion;}>} data
   */
  static registerSortOptionDataToStore(store, data) {
    store.state.sort = data;
  }

  /**
   * Gets facet data from the store.
   * @param {Record<String, unknown>} store
   * @param {string} facetType
   * @return {Object} The facet data.
   */
  static getFromStore(store, facetType) {
    return store.state[facetType];
  }

  /**
   * Gets sort options from the store.
   * @param {Record<String, Object>} store
   * @return {Array} The sort options.
   */
  static getSortOptionsFromStore(store) {
    return store.state.sort;
  }
}
