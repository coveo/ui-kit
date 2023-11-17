import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildFetchProductListingV2Response} from '../../../../test/mock-product-listing-v2';
import {
  FacetValueState,
  facetValueStates,
} from '../../../facets/facet-api/value';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
} from '../../../facets/facet-set/facet-set-actions';
import {convertFacetValueToRequest} from '../../../facets/facet-set/facet-set-slice';
import {fetchProductListing} from '../../product-listing/product-listing-actions';
import {commerceFacetSetReducer} from './facet-set-slice';
import {
  CommerceFacetSetState,
  getCommerceFacetSetInitialState,
} from './facet-set-state';
import {FacetResponse} from './interfaces/response';

describe('facet-set slice', () => {
  let state: CommerceFacetSetState;

  beforeEach(() => {
    state = getCommerceFacetSetInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = commerceFacetSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  describe.each([
    {
      title: 'dispatching #toggleSelectFacetValue with a registered facet id',
      facetValueState: 'selected' as FacetValueState,
      toggleAction: toggleSelectFacetValue,
    },
    {
      title: 'dispatching #toggleExcludeFacetValue with a registered facet id',
      facetValueState: 'excluded' as FacetValueState,
      toggleAction: toggleExcludeFacetValue,
    },
  ])('$title', ({facetValueState, toggleAction}) => {
    const facetId = '1';
    const oppositeFacetValueState = facetValueStates.find(
      (valueState) => ![facetValueState, 'idle'].includes(valueState)
    );
    describe('when the facet value exists', () => {
      it(`sets the state of an idle value to ${facetValueState}`, () => {
        const facetValue = buildMockCommerceFacetValue({value: 'TED'});
        const facetValueRequest = convertFacetValueToRequest(facetValue);

        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            values: [facetValueRequest],
          }),
        });

        const action = toggleAction({
          facetId,
          selection: facetValue,
        });
        const finalState = commerceFacetSetReducer(state, action);

        const targetValue = finalState[facetId]?.request.values.find(
          (req) => req.value === facetValue.value
        );
        expect(targetValue?.state).toBe(facetValueState);
      });

      it(`sets the state of an ${oppositeFacetValueState} value to ${facetValueState}`, () => {
        const facetValue = buildMockCommerceFacetValue({
          value: 'TED',
          state: oppositeFacetValueState,
        });
        const facetValueRequest = convertFacetValueToRequest(facetValue);

        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            values: [facetValueRequest],
          }),
        });

        const action = toggleAction({
          facetId,
          selection: facetValue,
        });
        const finalState = commerceFacetSetReducer(state, action);

        const targetValue = finalState[facetId]?.request.values.find(
          (req) => req.value === facetValue.value
        );
        expect(targetValue?.state).toBe(facetValueState);
      });

      it(`sets the state of a ${facetValueState} value to idle`, () => {
        const facetValue = buildMockCommerceFacetValue({
          value: 'TED',
          state: facetValueState,
        });
        const facetValueRequest = convertFacetValueToRequest(facetValue);

        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            values: [facetValueRequest],
          }),
        });

        const action = toggleAction({
          facetId,
          selection: facetValue,
        });
        const finalState = commerceFacetSetReducer(state, action);

        const targetValue = finalState[facetId]?.request.values.find(
          (req) => req.value === facetValue.value
        );
        expect(targetValue?.state).toBe('idle');
      });

      it('sets #preventAutoSelect to true', () => {
        const facetValue = buildMockCommerceFacetValue({value: 'TED'});
        const facetValueRequest = convertFacetValueToRequest(facetValue);

        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            values: [facetValueRequest],
          }),
        });

        const action = toggleAction({
          facetId,
          selection: facetValue,
        });
        const finalState = commerceFacetSetReducer(state, action);

        expect(finalState[facetId]?.request.preventAutoSelect).toBe(true);
      });
    });

    describe.each([
      {
        facetValueState: 'selected' as FacetValueState,
        toggleAction: toggleSelectFacetValue,
      },
      {
        facetValueState: 'excluded' as FacetValueState,
        toggleAction: toggleExcludeFacetValue,
      },
    ])(
      'when the facet value does not exist',
      ({facetValueState, toggleAction}) => {
        it('replaces the first idle value with the new value', () => {
          const newFacetValue = buildMockCommerceFacetValue({
            value: 'TED',
            state: facetValueState,
          });

          state[facetId] = buildMockCommerceFacetSlice({
            request: buildMockCommerceFacetRequest({
              values: [
                buildMockCommerceFacetValue({
                  value: 'active1',
                  state: facetValueState,
                }),
                buildMockCommerceFacetValue({
                  value: 'active2',
                  state: facetValueState,
                }),
                buildMockCommerceFacetValue({value: 'idle1', state: 'idle'}),
                buildMockCommerceFacetValue({value: 'idle2', state: 'idle'}),
              ],
            }),
          });

          const action = toggleAction({
            facetId,
            selection: newFacetValue,
          });

          const finalState = commerceFacetSetReducer(state, action);
          expect(
            finalState[facetId]?.request.values.indexOf(newFacetValue)
          ).toBe(2);
          expect(finalState[facetId]?.request.values.length).toBe(4);
        });

        it('sets #preventAutoSelect to true', () => {
          state[facetId] = buildMockCommerceFacetSlice({
            request: buildMockCommerceFacetRequest({values: []}),
          });

          const action = toggleAction({
            facetId,
            selection: buildMockCommerceFacetValue({value: 'TED'}),
          });
          const finalState = commerceFacetSetReducer(state, action);

          expect(finalState[facetId]?.request.preventAutoSelect).toBe(true);
        });
      }
    );
  });

  it('dispatching #toggleSelectFacetValue with an invalid id does not throw', () => {
    const facetValue = buildMockCommerceFacetValue({value: 'TED'});
    const action = toggleSelectFacetValue({
      facetId: '1',
      selection: facetValue,
    });

    expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
  });

  it('dispatching #toggleExcludeFacetValue with an invalid id does not throw', () => {
    const facetValue = buildMockCommerceFacetValue({value: 'TED'});
    const action = toggleExcludeFacetValue({
      facetId: '1',
      selection: facetValue,
    });

    expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
  });

  describe('#updateFacetIsFieldExpanded', () => {
    it('dispatching with a registered id updates the value', () => {
      const facetId = '1';
      const isFieldExpanded = true;
      state[facetId] = buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest({
          isFieldExpanded: !isFieldExpanded,
        }),
      });

      const action = updateFacetIsFieldExpanded({facetId, isFieldExpanded});
      const finalState = commerceFacetSetReducer(state, action);

      expect(finalState[facetId]?.request.isFieldExpanded).toBe(
        isFieldExpanded
      );
    });

    it('dispatching with an unregistered id does not throw', () => {
      const action = updateFacetIsFieldExpanded({
        facetId: '1',
        isFieldExpanded: true,
      });
      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });
  });

  describe('#fetchProductListing.fulfilled', () => {
    function buildFetchProductListingAction(facets: FacetResponse[]) {
      const productListing = buildFetchProductListingV2Response();
      productListing.response.facets = facets;

      return fetchProductListing.fulfilled(productListing, '');
    }

    it('updates the currentValues of facet requests to the values in the response', () => {
      const facetId = '1';
      const facetValue = buildMockCommerceFacetValue({value: 'TED'});
      const facet = buildMockCommerceFacetResponse({
        facetId,
        values: [facetValue],
      });

      state[facetId] = buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest({facetId}),
      });

      const action = buildFetchProductListingAction([facet]);
      const finalState = commerceFacetSetReducer(state, action);

      const expectedFacetValueRequest = convertFacetValueToRequest(facetValue);
      expect(finalState[facetId]?.request.values).toEqual([
        expectedFacetValueRequest,
      ]);
    });

    it('sets #preventAutoSelect to false', () => {
      const facetId = '1';
      state[facetId] = buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest({preventAutoSelect: true}),
      });

      const facet = buildMockCommerceFacetResponse({
        facetId,
      });
      const action = buildFetchProductListingAction([facet]);

      const finalState = commerceFacetSetReducer(state, action);
      expect(finalState[facetId]?.request.preventAutoSelect).toBe(false);
    });

    it('response containing unregistered facet ids does not throw', () => {
      const facetId = '1';
      const facet = buildMockCommerceFacetResponse({
        facetId,
      });
      const action = buildFetchProductListingAction([facet]);

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('removes facets not in response', () => {
      const facetIdToRemove = 'facet-to-remove';
      const newFacetId = 'new-facet';
      state[facetIdToRemove] = buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest(),
      });

      const newFacet = buildMockCommerceFacetResponse({
        facetId: newFacetId,
      });
      const action = buildFetchProductListingAction([newFacet]);

      const finalState = commerceFacetSetReducer(state, action);
      expect(facetIdToRemove in finalState).toBe(false);
      expect(newFacetId in finalState).toBe(true);
    });
  });
});
