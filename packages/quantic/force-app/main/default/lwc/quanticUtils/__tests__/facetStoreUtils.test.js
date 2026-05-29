import {Store} from '../facetStoreUtils';

describe('storeUtils', () => {
  describe('Store.facetTypes', () => {
    it('should expose the expected facet type keys', () => {
      expect(Store.facetTypes).toEqual({
        FACETS: 'facets',
        NUMERICFACETS: 'numericFacets',
        DATEFACETS: 'dateFacets',
        CATEGORYFACETS: 'categoryFacets',
      });
    });
  });

  describe('Store.initialize', () => {
    it('should return a store with empty state', () => {
      const store = Store.initialize();
      expect(store).toEqual({
        state: {
          facets: {},
          numericFacets: {},
          dateFacets: {},
          categoryFacets: {},
          sort: {},
        },
      });
    });
  });

  describe('Store.registerFacetToStore', () => {
    it('should register facet data under the given facet type and id', () => {
      const store = Store.initialize();
      const data = {facetId: 'author', label: 'Author'};
      Store.registerFacetToStore(store, 'facets', data);
      expect(store.state.facets.author).toEqual(data);
    });

    it('should not overwrite an existing facet entry', () => {
      const store = Store.initialize();
      const data = {facetId: 'author', label: 'Author'};
      Store.registerFacetToStore(store, 'facets', data);
      Store.registerFacetToStore(store, 'facets', {
        facetId: 'author',
        label: 'Updated',
      });
      expect(store.state.facets.author.label).toBe('Author');
    });
  });

  describe('Store.registerSortOptionDataToStore', () => {
    it('should set sort data on the store', () => {
      const store = Store.initialize();
      const sortData = [{label: 'Relevance', value: 'relevance'}];
      Store.registerSortOptionDataToStore(store, sortData);
      expect(store.state.sort).toBe(sortData);
    });
  });

  describe('Store.getFromStore', () => {
    it('should return facet data for the given type', () => {
      const store = Store.initialize();
      const data = {facetId: 'source', label: 'Source'};
      Store.registerFacetToStore(store, 'facets', data);
      expect(Store.getFromStore(store, 'facets')).toEqual({source: data});
    });

    it('should return an empty object when no facets are registered', () => {
      const store = Store.initialize();
      expect(Store.getFromStore(store, 'facets')).toEqual({});
    });
  });

  describe('Store.getSortOptionsFromStore', () => {
    it('should return the sort options', () => {
      const store = Store.initialize();
      const sortData = [{label: 'Date', value: 'date'}];
      Store.registerSortOptionDataToStore(store, sortData);
      expect(Store.getSortOptionsFromStore(store)).toBe(sortData);
    });

    it('should return an empty object when no sort options are registered', () => {
      const store = Store.initialize();
      expect(Store.getSortOptionsFromStore(store)).toEqual({});
    });
  });
});
