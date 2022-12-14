import {InsightAppState} from '../../state/insight-app-state';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {buildMockCategoryFacetSlice} from '../../test/mock-category-facet-slice';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request';
import {buildMockDateFacetSlice} from '../../test/mock-date-facet-slice';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockFacetSlice} from '../../test/mock-facet-slice';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request';
import {buildMockNumericFacetSlice} from '../../test/mock-numeric-facet-slice';
import {buildMockTabSlice} from '../../test/mock-tab-state';
import {maximumNumberOfResultsFromIndex} from '../pagination/pagination-constants';
import {buildInsightSearchRequest} from './insight-search-request';

describe('insight search request', () => {
  let state: InsightAppState;

  beforeEach(() => {
    state = buildMockInsightState();
  });

  it('#insightSearchRequest returns the state #query', async () => {
    state.query.q = 'hello';
    const params = (await buildInsightSearchRequest(state)).request;

    expect(params.q).toBe(state.query.q);
  });

  it('#insightSearchRequest returns the state #sortCriteria', async () => {
    state.sortCriteria = 'qre';
    const params = (await buildInsightSearchRequest(state)).request;

    expect(params.sortCriteria).toBe(state.sortCriteria);
  });

  it('#insightSearchRequest returns the state #numberOfResults', async () => {
    state.pagination.numberOfResults = 10;
    const params = (await buildInsightSearchRequest(state)).request;

    expect(params.numberOfResults).toBe(state.pagination.numberOfResults);
  });

  it('#insightSearchRequest will modify #numberOfResults if it goes over index limits', async () => {
    state.pagination.numberOfResults = 10;
    state.pagination.firstResult = maximumNumberOfResultsFromIndex - 9;

    const params = (await buildInsightSearchRequest(state)).request;

    expect(params.numberOfResults).toBe(9);
  });

  it('#insightSearchRequest returns the state #firstResult', async () => {
    state.pagination.firstResult = 10;
    const params = (await buildInsightSearchRequest(state)).request;

    expect(params.firstResult).toBe(state.pagination.firstResult);
  });

  it('#insightSearchRequest returns the facets in the state #facetSet', async () => {
    const request = buildMockFacetRequest({field: 'objecttype'});
    state.facetSet[1] = buildMockFacetSlice({request});
    const {facets} = (await buildInsightSearchRequest(state)).request;

    expect(facets).toContainEqual(request);
  });

  it('#insightSearchRequest returns the facets in the state #numericFacetSet', async () => {
    const request = buildMockNumericFacetRequest({field: 'objecttype'});
    state.numericFacetSet[1] = buildMockNumericFacetSlice({request});

    const {facets} = (await buildInsightSearchRequest(state)).request;
    expect(facets).toContainEqual(request);
  });

  it('#insightSearchRequest returns the facets in the state #dateFacetSet', async () => {
    const request = buildMockDateFacetRequest({field: 'objecttype'});
    state.dateFacetSet[1] = buildMockDateFacetSlice({request});

    const {facets} = (await buildInsightSearchRequest(state)).request;
    expect(facets).toContainEqual(request);
  });

  it('#insightSearchRequest returns the facets in the #categoryFacetSet', async () => {
    const request = buildMockCategoryFacetRequest({field: 'objecttype'});
    state.categoryFacetSet[1] = buildMockCategoryFacetSlice({request});

    const {facets} = (await buildInsightSearchRequest(state)).request;
    expect(facets).toContainEqual(request);
  });

  it('#insightSearchRequest.fieldsToInclude holds the #fieldsToInclude', async () => {
    state.fields.fieldsToInclude = ['foo', 'bar'];
    expect(
      (await buildInsightSearchRequest(state)).request.fieldsToInclude
    ).toEqual(expect.arrayContaining(['foo', 'bar']));
  });

  it('#insightSearchRequest.fieldsToInclude does not holds #fieldsToInclude if #fetchAllFields is active', async () => {
    state.fields.fieldsToInclude = ['foo', 'bar'];
    state.fields.fetchAllFields = true;
    expect(
      (await buildInsightSearchRequest(state)).request.fieldsToInclude
    ).toBeUndefined();
  });

  it('when there are no cq expressions in state, cq is undefined', async () => {
    expect((await buildInsightSearchRequest(state)).request.cq).toBeUndefined();
  });

  it('when there is an active tab, it sets cq to the active tab expression', async () => {
    state.tabSet.a = buildMockTabSlice({expression: 'a', isActive: true});
    expect((await buildInsightSearchRequest(state)).request.cq).toBe('a');
  });
});
