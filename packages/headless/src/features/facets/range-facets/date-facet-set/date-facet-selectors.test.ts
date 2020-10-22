import {SearchAppState} from '../../../../state/search-app-state';
import {
  dataFacetResponseSelector,
  dateFacetSelectedValuesSelector,
} from './date-facet-selectors';
import {createMockState} from '../../../../test';
import {buildMockDateFacetRequest} from '../../../../test/mock-date-facet-request';
import {buildMockDateFacetResponse} from '../../../../test/mock-date-facet-response';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../../../test/mock-facet-response';

describe('date facet selectors', () => {
  const facetId = 'abc123';
  let state: SearchAppState;

  beforeEach(() => {
    state = createMockState();
  });

  it('#dateFacetResponseSelector returns undefined if the response does not exist', () => {
    const response = dataFacetResponseSelector(state, facetId);
    expect(response).toBeUndefined();
  });

  it('#dateFacetResponseSelector gets a valid date facet response', () => {
    state.dateFacetSet[facetId] = buildMockDateFacetRequest({facetId});
    const mockResponse = buildMockDateFacetResponse({facetId});
    state.search.response.facets = [mockResponse];

    const response = dataFacetResponseSelector(state, facetId);
    expect(response).toEqual(mockResponse);
  });

  it('#dateFacetResponseSelector returns undefined if facet is of wrong type', () => {
    state.facetSet[facetId] = buildMockFacetRequest({facetId});
    const mockResponse = buildMockFacetResponse({facetId});
    state.search.response.facets = [mockResponse];

    const response = dataFacetResponseSelector(state, facetId);
    expect(response).toBeUndefined();
  });

  describe('#dateFacetSelectedValuesSelector', () => {
    beforeEach(() => {
      state.dateFacetSet[facetId] = buildMockDateFacetRequest({facetId});
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
        state: 'idle',
      });
      state.search.response.facets = [
        buildMockDateFacetResponse({
          facetId,
          values: [mockValue, mockValue2],
        }),
      ];
      const selectedValues = dateFacetSelectedValuesSelector(state, facetId);
      expect(selectedValues).toEqual([mockValue]);
    });
  });
});
