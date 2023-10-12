import {InsightAppState} from '../../state/insight-app-state.js';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request.js';
import {buildMockCategoryFacetSlice} from '../../test/mock-category-facet-slice.js';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request.js';
import {buildMockDateFacetSlice} from '../../test/mock-date-facet-slice.js';
import {buildMockFacetRequest} from '../../test/mock-facet-request.js';
import {buildMockFacetSlice} from '../../test/mock-facet-slice.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request.js';
import {buildMockNumericFacetSlice} from '../../test/mock-numeric-facet-slice.js';
import {buildMockTabSlice} from '../../test/mock-tab-state.js';
import {CollectionId} from '../folding/folding-state.js';
import {maximumNumberOfResultsFromIndex} from '../pagination/pagination-constants.js';
import {
  buildInsightSearchRequest,
  buildInsightLoadCollectionRequest,
} from './insight-search-request.js';

describe('insight search request', () => {
  let state: InsightAppState;
  let collectionId: CollectionId;

  beforeEach(() => {
    state = buildMockInsightState();
    collectionId = 'mockCollectionId';
  });

  describe('when using buildInsightSearchRequest', () => {
    it('#buildInsightSearchRequest returns the state #query', async () => {
      state.query.q = 'hello';
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.q).toBe(state.query.q);
    });

    it('#buildInsightSearchRequest returns the state #sortCriteria', async () => {
      state.sortCriteria = 'qre';
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.sortCriteria).toBe(state.sortCriteria);
    });

    it('#buildInsightSearchRequest returns the facets in the state #facetSet', async () => {
      const request = buildMockFacetRequest({field: 'objecttype'});
      state.facetSet[1] = buildMockFacetSlice({request});
      const {facets} = (await buildInsightSearchRequest(state)).request;

      expect(facets).toContainEqual(request);
    });

    it('#buildInsightSearchRequest returns the facets in the state #numericFacetSet', async () => {
      const request = buildMockNumericFacetRequest({field: 'objecttype'});
      state.numericFacetSet[1] = buildMockNumericFacetSlice({request});

      const {facets} = (await buildInsightSearchRequest(state)).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightSearchRequest returns the facets in the state #dateFacetSet', async () => {
      const request = buildMockDateFacetRequest({field: 'objecttype'});
      state.dateFacetSet[1] = buildMockDateFacetSlice({request});

      const {facets} = (await buildInsightSearchRequest(state)).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightSearchRequest returns the facets in the #categoryFacetSet', async () => {
      const request = buildMockCategoryFacetRequest({field: 'objecttype'});
      state.categoryFacetSet[1] = buildMockCategoryFacetSlice({request});

      const {facets} = (await buildInsightSearchRequest(state)).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightSearchRequest.fieldsToInclude holds the #fieldsToInclude', async () => {
      state.fields.fieldsToInclude = ['foo', 'bar'];
      expect(
        (await buildInsightSearchRequest(state)).request.fieldsToInclude
      ).toEqual(expect.arrayContaining(['foo', 'bar']));
    });

    it('#buildInsightSearchRequest.fieldsToInclude does not holds #fieldsToInclude if #fetchAllFields is active', async () => {
      state.fields.fieldsToInclude = ['foo', 'bar'];
      state.fields.fetchAllFields = true;
      expect(
        (await buildInsightSearchRequest(state)).request.fieldsToInclude
      ).toBeUndefined();
    });

    it('#buildInsightSearchRequest returns the state #numberOfResults', async () => {
      state.pagination.numberOfResults = 10;
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.numberOfResults).toBe(state.pagination.numberOfResults);
    });

    it('#buildInsightSearchRequest will modify #numberOfResults if it goes over index limits', async () => {
      state.pagination.numberOfResults = 10;
      state.pagination.firstResult = maximumNumberOfResultsFromIndex - 9;

      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.numberOfResults).toBe(9);
    });

    it('#buildInsightSearchRequest returns the state #firstResult', async () => {
      state.pagination.firstResult = 10;
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.firstResult).toBe(state.pagination.firstResult);
    });

    it('when there are no cq expressions in state, cq is undefined', async () => {
      expect(
        (await buildInsightSearchRequest(state)).request.cq
      ).toBeUndefined();
    });

    it('when there is an active tab, it sets cq to the active tab expression', async () => {
      state.tabSet.a = buildMockTabSlice({expression: 'a', isActive: true});
      expect((await buildInsightSearchRequest(state)).request.cq).toBe('a');
    });
  });

  describe('when using buildInsightLoadCollectionRequest', () => {
    it('#buildInsightLoadCollectionRequest returns the state #query', async () => {
      state.query.q = 'hello';
      const params = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;

      expect(params.q).toBe(state.query.q);
    });

    it('#buildInsightLoadCollectionRequest returns the state #sortCriteria', async () => {
      state.sortCriteria = 'qre';
      const params = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;

      expect(params.sortCriteria).toBe(state.sortCriteria);
    });

    it('#buildInsightLoadCollectionRequest returns the facets in the state #facetSet', async () => {
      const request = buildMockFacetRequest({field: 'objecttype'});
      state.facetSet[1] = buildMockFacetSlice({request});
      const {facets} = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;

      expect(facets).toContainEqual(request);
    });

    it('#buildInsightLoadCollectionRequest returns the facets in the state #numericFacetSet', async () => {
      const request = buildMockNumericFacetRequest({field: 'objecttype'});
      state.numericFacetSet[1] = buildMockNumericFacetSlice({request});

      const {facets} = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightLoadCollectionRequest returns the facets in the state #dateFacetSet', async () => {
      const request = buildMockDateFacetRequest({field: 'objecttype'});
      state.dateFacetSet[1] = buildMockDateFacetSlice({request});

      const {facets} = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightLoadCollectionRequest returns the facets in the #categoryFacetSet', async () => {
      const request = buildMockCategoryFacetRequest({field: 'objecttype'});
      state.categoryFacetSet[1] = buildMockCategoryFacetSlice({request});

      const {facets} = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightLoadCollectionRequest.fieldsToInclude holds the #fieldsToInclude', async () => {
      state.fields.fieldsToInclude = ['foo', 'bar'];
      expect(
        (await buildInsightLoadCollectionRequest(state, collectionId)).request
          .fieldsToInclude
      ).toEqual(expect.arrayContaining(['foo', 'bar']));
    });

    it('#buildInsightLoadCollectionRequest.fieldsToInclude does not holds #fieldsToInclude if #fetchAllFields is active', async () => {
      state.fields.fieldsToInclude = ['foo', 'bar'];
      state.fields.fetchAllFields = true;
      expect(
        (await buildInsightLoadCollectionRequest(state, collectionId)).request
          .fieldsToInclude
      ).toBeUndefined();
    });

    it('#buildInsightLoadCollectionRequest sets the cq to the collectionId', async () => {
      expect(
        (await buildInsightLoadCollectionRequest(state, collectionId)).request
          .cq
      ).toBe(`@foldingcollection="${collectionId}"`);
    });

    it('when there is an active tab, it sets cq to the active tab expression', async () => {
      state.tabSet.a = buildMockTabSlice({
        expression: collectionId,
        isActive: true,
      });
      expect(
        (await buildInsightLoadCollectionRequest(state, collectionId)).request
          .cq
      ).toBe(`@foldingcollection="${collectionId}"`);
    });
  });
});
