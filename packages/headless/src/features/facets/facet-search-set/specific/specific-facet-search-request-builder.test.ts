import type {SearchAppState} from '../../../../state/search-app-state.js';
import {buildMockFacetSearch} from '../../../../test/mock-facet-search.js';
import {buildMockFacetSlice} from '../../../../test/mock-facet-slice.js';
import {buildMockFacetValueRequest} from '../../../../test/mock-facet-value-request.js';
import {buildMockNavigatorContextProvider} from '../../../../test/mock-navigator-context-provider.js';
import {createMockState} from '../../../../test/mock-state.js';
import {buildSearchRequest} from '../../../search/search-request.js';
import {buildSpecificFacetSearchRequest} from './specific-facet-search-request-builder.js';

describe('#buildSpecificFacetSearchRequest', () => {
  const id = '1';
  let state: SearchAppState;

  function setupState() {
    state = createMockState();
    state.facetSet[id] = buildMockFacetSlice();
    state.facetSearchSet[id] = buildMockFacetSearch();
  }

  function buildParams() {
    return buildSpecificFacetSearchRequest(
      id,
      state,
      buildMockNavigatorContextProvider()(),
      false
    );
  }

  beforeEach(() => setupState());

  it('retrieves the #captions from the facetSearchSet', async () => {
    const captions = {a: 'A'};
    state.facetSearchSet[id].options.captions = captions;

    expect((await buildParams()).captions).toEqual(captions);
  });

  it('retrieves the #numberOfValues from the facetSearchSet', async () => {
    const numberOfValues = 5;
    state.facetSearchSet[id].options.numberOfValues = numberOfValues;

    expect((await buildParams()).numberOfValues).toEqual(numberOfValues);
  });

  it('retrieves the #query from the facetSearchSet', async () => {
    const query = 'hello';
    state.facetSearchSet[id].options.query = query;

    expect((await buildParams()).query).toEqual(`*${query}*`);
  });

  it('retrieves the #field from the facetSet', async () => {
    const field = 'author';
    state.facetSet[id]!.request.field = field;

    expect((await buildParams()).field).toBe(field);
  });

  it('retrieves #filterFacetCount from the facetSet', async () => {
    state.facetSet[id]!.request.filterFacetCount = true;

    expect((await buildParams()).filterFacetCount).toBe(true);
  });

  it('builds the #ignoreValues from the facetSet non-idle #currentValues', async () => {
    const idle = buildMockFacetValueRequest({value: 'A'});
    const selected = buildMockFacetValueRequest({
      value: 'B',
      state: 'selected',
    });
    state.facetSet[id]!.request.currentValues = [idle, selected];

    expect((await buildParams()).ignoreValues).toEqual([selected.value]);
  });

  it('sets the #searchContext to the search request params', async () => {
    const request = (
      await buildSearchRequest(state, buildMockNavigatorContextProvider()())
    ).request;

    expect((await buildParams()).searchContext).toEqual({
      ...request,
      analytics: {
        ...request.analytics,
        clientId: expect.any(String),
        clientTimestamp: expect.any(String),
      },
    });
  });
});
