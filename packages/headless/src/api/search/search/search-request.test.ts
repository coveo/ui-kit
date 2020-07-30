import {searchRequestParams} from './search-request';
import {createMockState} from '../../../test/mock-state';
import {SearchPageState} from '../../../state';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockNumericFacetRequest} from '../../../test/mock-numeric-facet-request';
import {buildMockDateFacetRequest} from '../../../test/mock-date-facet-request';

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
    const request = buildMockFacetRequest({field: 'objecttype'});
    state.facetSet[1] = request;

    const {facets} = searchRequestParams(state);
    expect(facets).toContain(request);
  });

  it('#searchRequestParams returns the facets in the state #numericFacetSet', () => {
    const request = buildMockNumericFacetRequest({field: 'objecttype'});
    state.numericFacetSet[1] = request;

    const {facets} = searchRequestParams(state);
    expect(facets).toContain(request);
  });

  it('#searchRequestParams returns the facets in the state #dateFacetSet', () => {
    const request = buildMockDateFacetRequest({field: 'objecttype'});
    state.dateFacetSet[1] = request;

    const {facets} = searchRequestParams(state);
    expect(facets).toContain(request);
  });
});
