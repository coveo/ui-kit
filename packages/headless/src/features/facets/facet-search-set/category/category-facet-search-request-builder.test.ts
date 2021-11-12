import {createMockState} from '../../../../test/mock-state';
import {buildMockCategoryFacetSearch} from '../../../../test/mock-category-facet-search';
import {buildMockCategoryFacetValueRequest} from '../../../../test/mock-category-facet-value-request';
import {SearchAppState} from '../../../../state/search-app-state';
import {buildCategoryFacetSearchRequest} from './category-facet-search-request-builder';
import {buildMockCategoryFacetSlice} from '../../../../test/mock-category-facet-slice';
import {buildMockCategoryFacetRequest} from '../../../../test/mock-category-facet-request';
import {buildSearchRequest} from '../../../search/search-request';

describe('#buildCategoryFacetSearchRequest', () => {
  const id = '1';
  let state: SearchAppState;

  function setupState() {
    state = createMockState();
    state.categoryFacetSet[id] = buildMockCategoryFacetSlice();
    state.categoryFacetSearchSet[id] = buildMockCategoryFacetSearch();
  }

  function buildParams() {
    return buildCategoryFacetSearchRequest(id, state);
  }

  beforeEach(() => setupState());

  it('retrieves the #captions from the categoryFacetSearchSet', async () => {
    const captions = {a: 'A'};
    state.categoryFacetSearchSet[id].options.captions = captions;

    expect((await buildParams()).captions).toEqual(captions);
  });

  it('retrieves the #numberOfValues from the categoryFacetSearchSet', async () => {
    const numberOfValues = 5;
    state.categoryFacetSearchSet[id].options.numberOfValues = numberOfValues;

    expect((await buildParams()).numberOfValues).toEqual(numberOfValues);
  });

  it('retrieves the #query from the categoryFacetSearchSet', async () => {
    const query = 'hello';
    state.categoryFacetSearchSet[id].options.query = query;

    expect((await buildParams()).query).toEqual(`*${query}*`);
  });

  it('retrieves the #basePath fron the categoryFacetSet', async () => {
    const basePath = ['a'];
    const request = buildMockCategoryFacetRequest({basePath});
    state.categoryFacetSet[id] = buildMockCategoryFacetSlice({request});

    expect((await buildParams()).basePath).toBe(basePath);
  });

  it('retrieves the #field from the categoryFacetSet', async () => {
    const field = 'author';
    const request = buildMockCategoryFacetRequest({field});
    state.categoryFacetSet[id] = buildMockCategoryFacetSlice({request});

    expect((await buildParams()).field).toBe(field);
  });

  it('retrieves #filterFacetCount from the categoryFacetSet', async () => {
    const request = buildMockCategoryFacetRequest({filterFacetCount: true});
    state.categoryFacetSet[id] = buildMockCategoryFacetSlice({request});

    expect((await buildParams()).filterFacetCount).toBe(true);
  });

  it('retrieves the #delimitingCharacter from the categoryFacetSet', async () => {
    const delimitingCharacter = '|';
    const request = buildMockCategoryFacetRequest({delimitingCharacter});
    state.categoryFacetSet[id] = buildMockCategoryFacetSlice({request});

    expect((await buildParams()).delimitingCharacter).toBe(delimitingCharacter);
  });

  it('sets the #searchContext to the search request params', async () => {
    const facet = state.categoryFacetSet[id]!.request;
    const builtRequest = await buildSearchRequest(state);
    const request = {...builtRequest.request, facets: [facet]};

    expect((await buildParams()).searchContext).toEqual({
      ...request,
      visitorId: expect.any(String),
    });
  });

  it('#ignorePaths is empty when currentValues is empty', async () => {
    state.categoryFacetSet[id]!.request.currentValues = [];
    expect((await buildParams()).ignorePaths).toEqual([]);
  });

  it('#ignorePaths returns the correct path when currentValues has one level', async () => {
    state.categoryFacetSet[id]!.request.currentValues = [
      buildMockCategoryFacetValueRequest({
        value: 'level1',
        state: 'selected',
      }),
    ];
    expect((await buildParams()).ignorePaths).toEqual([['level1']]);
  });

  it('#ignorePaths returns the correct path when currentValues has more than one level', async () => {
    state.categoryFacetSet[id]!.request.currentValues = [
      buildMockCategoryFacetValueRequest({
        value: 'level1',
        children: [
          buildMockCategoryFacetValueRequest({
            value: 'level2',
            state: 'selected',
          }),
        ],
      }),
    ];
    expect((await buildParams()).ignorePaths).toEqual([['level1', 'level2']]);
  });
});
