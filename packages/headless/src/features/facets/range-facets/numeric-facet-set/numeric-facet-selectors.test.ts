import {SearchAppState} from '../../../../state/search-app-state';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../../../test/mock-facet-response';
import {buildMockFacetSlice} from '../../../../test/mock-facet-slice';
import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request';
import {buildMockNumericFacetResponse} from '../../../../test/mock-numeric-facet-response';
import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {createMockState} from '../../../../test/mock-state';
import {
  numericFacetExcludedValuesSelector,
  numericFacetResponseSelector,
  numericFacetSelectedValuesSelector,
} from './numeric-facet-selectors';

describe('numeric facet selectors', () => {
  const facetId = 'abc123';
  let state: SearchAppState;

  beforeEach(() => {
    state = createMockState();
  });
  it('#numericFacetResponseSelector returns undefined if the response does not exist', () => {
    const response = numericFacetResponseSelector(state, facetId);
    expect(response).toBeUndefined();
  });

  it('#numericFacetResponseSelector gets a valid numeric facet response', () => {
    state.numericFacetSet[facetId] = buildMockNumericFacetSlice({
      request: buildMockNumericFacetRequest({facetId}),
    });
    const mockResponse = buildMockNumericFacetResponse({facetId});
    state.search.response.facets = [mockResponse];

    const response = numericFacetResponseSelector(state, facetId);
    expect(response).toEqual(mockResponse);
  });

  it('#numericFacetResponseSelector returns undefined if facet is of wrong type', () => {
    state.facetSet[facetId] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId}),
    });
    const mockResponse = buildMockFacetResponse({facetId});
    state.search.response.facets = [mockResponse];

    const response = numericFacetResponseSelector(state, facetId);
    expect(response).toBeUndefined();
  });

  describe('#numericFacetSelectedValuesSelector', () => {
    beforeEach(() => {
      state.numericFacetSet[facetId] = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({facetId}),
      });
    });

    it('#numericFacetSelectedValuesSelector returns an empty array if the facet does not exist', () => {
      const selectedValues = numericFacetSelectedValuesSelector(state, facetId);
      expect(selectedValues).toEqual([]);
    });

    it('#numericFacetSelectedValuesSelector returns only the selected values for the provided facetId', () => {
      const mockValue = buildMockNumericFacetValue({
        state: 'selected',
      });
      const mockValue2 = buildMockNumericFacetValue({
        state: 'excluded',
      });
      const mockValue3 = buildMockNumericFacetValue({
        state: 'idle',
      });
      state.search.response.facets = [
        buildMockNumericFacetResponse({
          facetId,
          values: [mockValue, mockValue2, mockValue3],
        }),
      ];
      const selectedValues = numericFacetSelectedValuesSelector(state, facetId);
      expect(selectedValues).toEqual([mockValue]);
    });
  });

  describe('#numericFacetExcludedValuesSelector', () => {
    beforeEach(() => {
      state.numericFacetSet[facetId] = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({facetId}),
      });
    });

    it('#numericFacetExcludedValuesSelector returns an empty array if the facet does not exist', () => {
      const selectedValues = numericFacetExcludedValuesSelector(state, facetId);
      expect(selectedValues).toEqual([]);
    });

    it('#numericFacetExcludedValuesSelector returns only the excluded values for the provided facetId', () => {
      const mockValue = buildMockNumericFacetValue({
        state: 'excluded',
      });
      const mockValue2 = buildMockNumericFacetValue({
        state: 'selected',
      });
      const mockValue3 = buildMockNumericFacetValue({
        state: 'idle',
      });
      state.search.response.facets = [
        buildMockNumericFacetResponse({
          facetId,
          values: [mockValue, mockValue2, mockValue3],
        }),
      ];
      const selectedValues = numericFacetExcludedValuesSelector(state, facetId);
      expect(selectedValues).toEqual([mockValue]);
    });
  });
});
