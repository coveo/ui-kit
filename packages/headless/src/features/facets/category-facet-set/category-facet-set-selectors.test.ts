import type {SearchAppState} from '../../../state/search-app-state.js';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request.js';
import {buildMockCategoryFacetResponse} from '../../../test/mock-category-facet-response.js';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice.js';
import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value.js';
import {buildMockFacetRequest} from '../../../test/mock-facet-request.js';
import {buildMockFacetResponse} from '../../../test/mock-facet-response.js';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  categoryFacetResponseSelectedValuesSelector,
  categoryFacetResponseSelector,
} from './category-facet-set-selectors.js';

describe('category facet selectors', () => {
  const facetId = 'abc123';
  let state: SearchAppState;

  beforeEach(() => {
    state = createMockState();
  });

  it('#categoryFacetResponseSelector returns undefined if the response does not exist', () => {
    const response = categoryFacetResponseSelector(state, facetId);
    expect(response).toBeUndefined();
  });

  it('#categoryFacetResponseSelector gets a valid date category response', () => {
    const request = buildMockCategoryFacetRequest({facetId});
    state.categoryFacetSet[facetId] = buildMockCategoryFacetSlice({request});
    const mockResponse = buildMockCategoryFacetResponse({facetId});
    state.search.response.facets = [mockResponse];

    const response = categoryFacetResponseSelector(state, facetId);
    expect(response).toEqual(mockResponse);
  });

  it('#categoryFacetResponseSelector returns undefined if facet is of wrong type', () => {
    state.facetSet[facetId] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId}),
    });
    const mockResponse = buildMockFacetResponse({facetId});
    state.search.response.facets = [mockResponse];

    const response = categoryFacetResponseSelector(state, facetId);
    expect(response).toBeUndefined();
  });

  describe('#categoryFacetSelectedValuesSelector', () => {
    beforeEach(() => {
      const request = buildMockCategoryFacetRequest({facetId});
      state.categoryFacetSet[facetId] = buildMockCategoryFacetSlice({request});
    });

    it('#categoryFacetSelectedValuesSelector returns an empty array if the facet does not exist', () => {
      const selectedResults = categoryFacetResponseSelectedValuesSelector(
        state,
        facetId
      );
      expect(selectedResults).toEqual([]);
    });

    it('#categoryFacetSelectedValuesSelector gets the top level selected value', () => {
      const mockValue = buildMockCategoryFacetValue({
        value: 'test',
        state: 'selected',
      });
      state.search.response.facets = [
        buildMockCategoryFacetResponse({
          facetId,
          values: [mockValue],
        }),
      ];
      const selectedResults = categoryFacetResponseSelectedValuesSelector(
        state,
        facetId
      );
      expect(selectedResults).toEqual([mockValue]);
    });

    it('#categoryFacetSelectedValuesSelector only returns the selected value', () => {
      const ignoredValue = buildMockCategoryFacetValue({
        value: 'nestedTest',
        state: 'idle',
      });
      const mockValue = buildMockCategoryFacetValue({
        value: 'test',
        state: 'selected',
      });
      state.search.response.facets = [
        buildMockCategoryFacetResponse({
          facetId,
          values: [mockValue, ignoredValue],
        }),
      ];
      const selectedResults = categoryFacetResponseSelectedValuesSelector(
        state,
        facetId
      );
      expect(selectedResults).toEqual([mockValue]);
    });

    it('#categoryFacetSelectedValuesSelector gets the path to a nested value', () => {
      const nestedChild = buildMockCategoryFacetValue({
        value: 'nestedTest',
        state: 'selected',
      });
      const mockValue = buildMockCategoryFacetValue({
        value: 'test',
        state: 'idle',
        children: [nestedChild],
      });
      state.search.response.facets = [
        buildMockCategoryFacetResponse({
          facetId,
          values: [mockValue],
        }),
      ];
      const selectedResults = categoryFacetResponseSelectedValuesSelector(
        state,
        facetId
      );
      expect(selectedResults).toEqual([mockValue, nestedChild]);
    });
  });
});
