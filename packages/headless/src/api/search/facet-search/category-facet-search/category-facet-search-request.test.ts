import {createMockState} from '../../../../test/mock-state';
import {buildMockCategoryFacetSearch} from '../../../../test/mock-category-facet-search';
import {buildMockCategoryFacetValueRequest} from '../../../../test/mock-category-facet-value-request';
import {SearchAppState} from '../../../../state/search-app-state';
import {buildCategoryFacetSearchRequest} from '../../../../features/facets/facet-search-set/category/category-facet-search-request-builder';
import {buildMockCategoryFacetSlice} from '../../../../test/mock-category-facet-slice';
import {buildMockCategoryFacetRequest} from '../../../../test/mock-category-facet-request';
import {buildSearchRequest} from '../../../../features/search/search-actions';

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

  it('retrieves the #captions from the categoryFacetSearchSet', () => {
    const captions = {a: 'A'};
    state.categoryFacetSearchSet[id].options.captions = captions;

    expect(buildParams().captions).toEqual(captions);
  });

  it('retrieves the #numberOfValues from the categoryFacetSearchSet', () => {
    const numberOfValues = 5;
    state.categoryFacetSearchSet[id].options.numberOfValues = numberOfValues;

    expect(buildParams().numberOfValues).toEqual(numberOfValues);
  });

  it('retrieves the #query from the categoryFacetSearchSet', () => {
    const query = 'hello';
    state.categoryFacetSearchSet[id].options.query = query;

    expect(buildParams().query).toEqual(`*${query}*`);
  });

  it('retrieves the #basePath fron the categoryFacetSet', () => {
    const basePath = ['a'];
    const request = buildMockCategoryFacetRequest({basePath});
    state.categoryFacetSet[id] = buildMockCategoryFacetSlice({request});

    expect(buildParams().basePath).toBe(basePath);
  });

  it('retrieves the #field from the categoryFacetSet', () => {
    const field = 'author';
    const request = buildMockCategoryFacetRequest({field});
    state.categoryFacetSet[id] = buildMockCategoryFacetSlice({request});

    expect(buildParams().field).toBe(field);
  });

  it('retrieves the #delimitingCharacter from the categoryFacetSet', () => {
    const delimitingCharacter = '|';
    const request = buildMockCategoryFacetRequest({delimitingCharacter});
    state.categoryFacetSet[id] = buildMockCategoryFacetSlice({request});

    expect(buildParams().delimitingCharacter).toBe(delimitingCharacter);
  });

  it('sets the #searchContext to the search request params', () => {
    const facet = state.categoryFacetSet[id]!.request;
    const request = {...buildSearchRequest(state).request, facets: [facet]};

    expect(buildParams().searchContext).toEqual({
      ...request,
      visitorId: expect.any(String),
    });
  });

  it('#ignorePaths is empty when currentValues is empty', () => {
    state.categoryFacetSet[id]!.request.currentValues = [];
    expect(buildParams().ignorePaths).toEqual([]);
  });

  it('#ignorePaths returns the correct path when currentValues has one level', () => {
    state.categoryFacetSet[id]!.request.currentValues = [
      buildMockCategoryFacetValueRequest({
        value: 'level1',
        state: 'selected',
      }),
    ];
    expect(buildParams().ignorePaths).toEqual([['level1']]);
  });

  it('#ignorePaths returns the correct path when currentValues has more than one level', () => {
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
    expect(buildParams().ignorePaths).toEqual([['level1', 'level2']]);
  });
});
