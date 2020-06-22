import {searchRequestParams} from './search-request';
import {createMockState} from '../../../test/mock-state';
import {SearchPageState} from '../../../state';
import {buildFacetRequest} from '../../../features/facets/facet-set/facet-set-slice';

describe('search request', () => {
  let state: SearchPageState;

  beforeEach(() => {
    state = createMockState();
  });

  it('#searchRequestParams returns the state #query', () => {
    state.query.q = 'hello';
    const params = searchRequestParams(state);

    expect(params.q).toBe(state.query.q);
  });

  it('#searchRequestParams returns the state #sortCriteria', () => {
    state.sortCriteria = 'qre';
    const params = searchRequestParams(state);

    expect(params.sortCriteria).toBe(state.sortCriteria);
  });

  it('#searchRequestParams returns the state #numberOfResults', () => {
    state.pagination.numberOfResults = 10;
    const params = searchRequestParams(state);

    expect(params.numberOfResults).toBe(state.pagination.numberOfResults);
  });

  it('#searchRequestParams returns the state #firstResult', () => {
    state.pagination.firstResult = 10;
    const params = searchRequestParams(state);

    expect(params.firstResult).toBe(state.pagination.firstResult);
  });

  it('#searchRequestParams returns the facets in the state #facetSet', () => {
    const request1 = buildFacetRequest({field: 'objecttype'});
    const request2 = buildFacetRequest({field: 'author'});

    state.facetSet[1] = request1;
    state.facetSet[2] = request2;

    const params = searchRequestParams(state);

    expect(params.facets).toContain(request1);
    expect(params.facets).toContain(request2);
  });
});
