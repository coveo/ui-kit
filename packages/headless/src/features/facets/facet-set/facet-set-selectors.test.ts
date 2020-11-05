import {createMockState} from '../../../test/mock-state';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {
  baseFacetResponseSelector,
  facetRequestSelector,
  facetResponseSelectedValuesSelector,
} from './facet-set-selectors';
import {SearchAppState} from '../../../state/search-app-state';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetValue} from '../../../test/mock-facet-value';

describe('facet-set selectors', () => {
  it('#facetSelector gets the facet response by id', () => {
    const facetId = '1';
    const state = createMockState();
    const facetResponse = buildMockFacetResponse({facetId});
    state.search.response.facets = [facetResponse];

    expect(baseFacetResponseSelector(state, facetId)).toBe(facetResponse);
  });

  it('when the id is not found, #facetSelector returns undefined', () => {
    const state = createMockState();
    expect(baseFacetResponseSelector(state, '1')).toBe(undefined);
  });

  it('#facetRequestSelector gets the facet request by id', () => {
    const facetId = '1';
    const state = createMockState();
    const facetRequest = buildMockFacetRequest({facetId});
    state.facetSet[facetId] = facetRequest;

    expect(facetRequestSelector(state, facetId)).toBe(facetRequest);
  });

  describe('#facetResponseSelectedValuesSelector', () => {
    const facetId = 'abc123';
    let state: SearchAppState;

    beforeEach(() => {
      state = createMockState();
      state.facetSet[facetId] = buildMockFacetRequest({facetId});
    });

    it('#facetResponseSelectedValuesSelector returns an empty array if the facet does not exist', () => {
      const selectedValues = facetResponseSelectedValuesSelector(
        state,
        facetId
      );
      expect(selectedValues).toEqual([]);
    });

    it('#facetResponseSelectedValuesSelector gets the selected selected value for a generic facet', () => {
      const mockValue = buildMockFacetValue({
        state: 'selected',
      });
      state.search.response.facets = [
        buildMockFacetResponse({
          facetId,
          values: [mockValue],
        }),
      ];
      const selectedValues = facetResponseSelectedValuesSelector(
        state,
        facetId
      );
      expect(selectedValues).toEqual([mockValue]);
    });

    it('#facetResponseSelectedValuesSelector gets all the selected values if more than one exists', () => {
      const mockValue = buildMockFacetValue({
        value: 'test1',
        state: 'selected',
      });
      const mockValue2 = buildMockFacetValue({
        value: 'test2',
        state: 'selected',
      });
      state.search.response.facets = [
        buildMockFacetResponse({
          facetId,
          values: [mockValue, mockValue2],
        }),
      ];
      const selectedValues = facetResponseSelectedValuesSelector(
        state,
        facetId
      );
      expect(selectedValues).toContain(mockValue);
      expect(selectedValues).toContain(mockValue2);
    });

    it('#facetResponseSelectedValuesSelector only gets the selected values', () => {
      const mockValue = buildMockFacetValue({
        value: 'test1',
        state: 'selected',
      });
      const mockValue2 = buildMockFacetValue({
        value: 'test2',
        state: 'idle',
      });
      state.search.response.facets = [
        buildMockFacetResponse({
          facetId,
          values: [mockValue, mockValue2],
        }),
      ];
      const selectedValues = facetResponseSelectedValuesSelector(
        state,
        facetId
      );
      expect(selectedValues).toContain(mockValue);
      expect(selectedValues).not.toContain(mockValue2);
    });
  });
});
