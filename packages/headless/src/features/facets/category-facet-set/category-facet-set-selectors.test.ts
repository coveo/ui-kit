import {SearchAppState} from '../../../state/search-app-state';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {buildMockCategoryFacetResponse} from '../../../test/mock-category-facet-response';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice';
import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice';
import {createMockState} from '../../../test/mock-state';
import {
  categoryFacetResponseSelector,
  categoryFacetResponseActiveValuesSelector,
} from './category-facet-set-selectors';

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

  describe('#categoryFacetResponseActiveValuesSelector', () => {
    beforeEach(() => {
      const request = buildMockCategoryFacetRequest({facetId});
      state.categoryFacetSet[facetId] = buildMockCategoryFacetSlice({request});
    });

    it('#categoryFacetResponseActiveValuesSelector returns an empty array if the facet does not exist', () => {
      const selectedResults = categoryFacetResponseActiveValuesSelector(
        state,
        facetId
      );
      expect(selectedResults).toEqual([]);
    });

    it('#categoryFacetResponseActiveValuesSelector gets the top level selected value', () => {
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
      const selectedResults = categoryFacetResponseActiveValuesSelector(
        state,
        facetId
      );
      expect(selectedResults).toEqual([mockValue]);
    });

    it('#categoryFacetResponseActiveValuesSelector gets the top level excluded value', () => {
      const mockValue = buildMockCategoryFacetValue({
        value: 'test',
        state: 'excluded',
      });
      state.search.response.facets = [
        buildMockCategoryFacetResponse({
          facetId,
          values: [mockValue],
        }),
      ];
      const selectedResults = categoryFacetResponseActiveValuesSelector(
        state,
        facetId
      );
      expect(selectedResults).toEqual([mockValue]);
    });

    it('#categoryFacetResponseActiveValuesSelector only returns the selected value', () => {
      const ignoredValue = buildMockCategoryFacetValue({
        value: 'nestedTest',
        state: 'idle',
      });
      const mockSelectedValue = buildMockCategoryFacetValue({
        value: 'selectedTest',
        state: 'selected',
      });
      state.search.response.facets = [
        buildMockCategoryFacetResponse({
          facetId,
          values: [mockSelectedValue, ignoredValue],
        }),
      ];
      const activeResults = categoryFacetResponseActiveValuesSelector(
        state,
        facetId
      );
      expect(activeResults).toEqual([mockSelectedValue]);
    });

    it('#categoryFacetResponseActiveValuesSelector only returns the excluded value', () => {
      const ignoredValue = buildMockCategoryFacetValue({
        value: 'nestedTest',
        state: 'idle',
      });
      const mockExcludedValue = buildMockCategoryFacetValue({
        value: 'excludedTest',
        state: 'excluded',
      });
      state.search.response.facets = [
        buildMockCategoryFacetResponse({
          facetId,
          values: [mockExcludedValue, ignoredValue],
        }),
      ];
      const activeResults = categoryFacetResponseActiveValuesSelector(
        state,
        facetId
      );
      expect(activeResults).toEqual([mockExcludedValue]);
    });

    it('#categoryFacetResponseActiveValuesSelector gets the path to a nested selected value', () => {
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
      const selectedResults = categoryFacetResponseActiveValuesSelector(
        state,
        facetId
      );
      expect(selectedResults).toEqual([mockValue, nestedChild]);
    });

    it('#categoryFacetResponseActiveValuesSelector gets the path to a nested excluded value', () => {
      const nestedChild = buildMockCategoryFacetValue({
        value: 'nestedTest',
        state: 'excluded',
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
      const selectedResults = categoryFacetResponseActiveValuesSelector(
        state,
        facetId
      );
      expect(selectedResults).toEqual([mockValue, nestedChild]);
    });
  });
});
