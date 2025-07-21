import type {SearchAppState} from '../../../../state/search-app-state.js';
import {buildMockDateFacetRequest} from '../../../../test/mock-date-facet-request.js';
import {buildMockDateFacetResponse} from '../../../../test/mock-date-facet-response.js';
import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice.js';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value.js';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request.js';
import {buildMockFacetResponse} from '../../../../test/mock-facet-response.js';
import {buildMockFacetSlice} from '../../../../test/mock-facet-slice.js';
import {createMockState} from '../../../../test/mock-state.js';
import {
  dateFacetExcludedValuesSelector,
  dateFacetResponseSelector,
  dateFacetSelectedValuesSelector,
} from './date-facet-selectors.js';

describe('date facet selectors', () => {
  const facetId = 'abc123';
  let state: SearchAppState;

  beforeEach(() => {
    state = createMockState();
  });

  it('#dateFacetResponseSelector returns undefined if the response does not exist', () => {
    const response = dateFacetResponseSelector(state, facetId);
    expect(response).toBeUndefined();
  });

  it('#dateFacetResponseSelector gets a valid date facet response', () => {
    state.dateFacetSet[facetId] = buildMockDateFacetSlice({
      request: buildMockDateFacetRequest({facetId}),
    });
    const mockResponse = buildMockDateFacetResponse({facetId});
    state.search.response.facets = [mockResponse];

    const response = dateFacetResponseSelector(state, facetId);
    expect(response).toEqual(mockResponse);
  });

  it('#dateFacetResponseSelector returns undefined if facet is of wrong type', () => {
    state.facetSet[facetId] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId}),
    });
    const mockResponse = buildMockFacetResponse({facetId});
    state.search.response.facets = [mockResponse];

    const response = dateFacetResponseSelector(state, facetId);
    expect(response).toBeUndefined();
  });

  describe('#dateFacetSelectedValuesSelector', () => {
    beforeEach(() => {
      state.dateFacetSet[facetId] = buildMockDateFacetSlice({
        request: buildMockDateFacetRequest({facetId}),
      });
    });

    it('#dateFacetSelectedValuesSelector returns an empty array if the facet does not exist', () => {
      const selectedValues = dateFacetSelectedValuesSelector(state, facetId);
      expect(selectedValues).toEqual([]);
    });

    it('#dateFacetSelectedValuesSelector returns only the selected values for the provided facetId', () => {
      const mockValue = buildMockDateFacetValue({
        state: 'selected',
      });
      const mockValue2 = buildMockDateFacetValue({
        state: 'excluded',
      });
      const mockValue3 = buildMockDateFacetValue({
        state: 'idle',
      });
      state.search.response.facets = [
        buildMockDateFacetResponse({
          facetId,
          values: [mockValue, mockValue2, mockValue3],
        }),
      ];
      const selectedValues = dateFacetSelectedValuesSelector(state, facetId);
      expect(selectedValues).toEqual([mockValue]);
    });
  });

  describe('#dateFacetExcludedValuesSelector', () => {
    beforeEach(() => {
      state.dateFacetSet[facetId] = buildMockDateFacetSlice({
        request: buildMockDateFacetRequest({facetId}),
      });
    });

    it('#dateFacetExcludedValuesSelector returns an empty array if the facet does not exist', () => {
      const selectedValues = dateFacetExcludedValuesSelector(state, facetId);
      expect(selectedValues).toEqual([]);
    });

    it('#dateFacetExcludedValuesSelector returns only the excluded values for the provided facetId', () => {
      const mockValue = buildMockDateFacetValue({
        state: 'excluded',
      });
      const mockValue2 = buildMockDateFacetValue({
        state: 'selected',
      });
      const mockValue3 = buildMockDateFacetValue({
        state: 'idle',
      });
      state.search.response.facets = [
        buildMockDateFacetResponse({
          facetId,
          values: [mockValue, mockValue2, mockValue3],
        }),
      ];
      const selectedValues = dateFacetExcludedValuesSelector(state, facetId);
      expect(selectedValues).toEqual([mockValue]);
    });
  });
});
