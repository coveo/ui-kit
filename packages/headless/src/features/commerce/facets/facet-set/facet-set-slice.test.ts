import {Action} from '@reduxjs/toolkit';
import {
  DateRangeRequest,
  FacetValueRequest,
  NumericRangeRequest,
} from '../../../../controllers/commerce/core/facets/headless-core-commerce-facet';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {
  buildMockCommerceDateFacetResponse,
  buildMockCommerceNumericFacetResponse,
  buildMockCommerceRegularFacetResponse,
} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {
  buildMockCommerceDateFacetValue,
  buildMockCommerceNumericFacetValue,
  buildMockCommerceRegularFacetValue,
} from '../../../../test/mock-commerce-facet-value';
import {buildSearchResponse} from '../../../../test/mock-commerce-search';
import {buildMockFacetSearchResult} from '../../../../test/mock-facet-search-result';
import {buildFetchProductListingV2Response} from '../../../../test/mock-product-listing-v2';
import {deselectAllBreadcrumbs} from '../../../breadcrumb/breadcrumb-actions';
import {
  FacetValueState,
  facetValueStates,
} from '../../../facets/facet-api/value';
import {
  excludeFacetSearchResult,
  selectFacetSearchResult,
} from '../../../facets/facet-search-set/specific/specific-facet-search-actions';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
} from '../../../facets/facet-set/facet-set-actions';
import {convertFacetValueToRequest} from '../../../facets/facet-set/facet-set-slice';
import {updateFacetAutoSelection} from '../../../facets/generic/facet-actions';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../../facets/range-facets/date-facet-set/date-facet-actions';
import {convertToDateRangeRequests} from '../../../facets/range-facets/date-facet-set/date-facet-set-slice';
import {findExactRangeValue} from '../../../facets/range-facets/generic/range-facet-reducers';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {convertToNumericRangeRequests} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {setContext, setUser, setView} from '../../context/context-actions';
import {fetchProductListing} from '../../product-listing/product-listing-actions';
import {executeSearch} from '../../search/search-actions';
import {commerceFacetSetReducer} from './facet-set-slice';
import {
  CommerceFacetSetState,
  getCommerceFacetSetInitialState,
} from './facet-set-state';
import {AnyFacetResponse, FacetType} from './interfaces/response';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionCreator = (payload: any) => Action;

describe('commerceFacetSetReducer', () => {
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
      actionName: '#fetchProductListing.fulfilled',
      action: fetchProductListing.fulfilled,
      responseBuilder: buildFetchProductListingV2Response,
    },
    {
      actionName: '#executeSearch.fulfilled',
      action: executeSearch.fulfilled,
      responseBuilder: buildSearchResponse,
    },
  ])(
    '$actionName ',
    ({
      action,
      responseBuilder,
    }: {
      action: typeof fetchProductListing.fulfilled;
      responseBuilder: () => ReturnType<typeof buildSearchResponse>;
    }) => {
      const facetId = '1';
      function buildQueryAction(facets: AnyFacetResponse[]) {
        const response = responseBuilder();
        response.response.facets = facets;

        return action(response, '');
      }

      it('updates the values of regular facet requests to the corresponding values in the response', () => {
        const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
        const facet = buildMockCommerceRegularFacetResponse({
          facetId,
          values: [facetValue],
        });

        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({type: 'regular', facetId}),
        });

        const action = buildQueryAction([facet]);
        const finalState = commerceFacetSetReducer(state, action);

        const expectedFacetValueRequest =
          convertFacetValueToRequest(facetValue);
        expect(finalState[facetId]?.request.values).toEqual([
          expectedFacetValueRequest,
        ]);
      });

      it('updates the values of numeric facet requests to the corresponding values in the response', () => {
        const facetValue = buildMockCommerceNumericFacetValue();
        const facet = buildMockCommerceNumericFacetResponse({
          facetId,
          values: [facetValue],
        });

        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            type: 'numericalRange',
            facetId,
          }),
        });

        const action = buildQueryAction([facet]);
        const finalState = commerceFacetSetReducer(state, action);

        const expectedFacetValueRequests = convertToNumericRangeRequests([
          facetValue,
        ]);
        expect(finalState[facetId]?.request.values).toEqual(
          expectedFacetValueRequests
        );
      });

      it('updates the values of date facet requests to the corresponding values in the response', () => {
        const facetValue = buildMockCommerceDateFacetValue({
          start: '2023-01-01',
          end: '2024-01-01',
        });
        const facet = buildMockCommerceDateFacetResponse({
          facetId,
          values: [facetValue],
        });

        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            type: 'dateRange',
            facetId,
          }),
        });

        const action = buildQueryAction([facet]);
        const finalState = commerceFacetSetReducer(state, action);

        const expectedFacetValueRequests = convertToDateRangeRequests([
          facetValue,
        ]);
        expect(finalState[facetId]?.request.values).toEqual(
          expectedFacetValueRequests
        );
      });

      // TODO: it('updates the values of category facet requests to the corresponding values in the response', () => {

      describe.each([
        {
          type: 'regular' as FacetType,
          facetResponseBuilder: buildMockCommerceRegularFacetResponse,
        },
        {
          type: 'numericalRange' as FacetType,
          facetResponseBuilder: buildMockCommerceNumericFacetResponse,
        },
        {
          type: 'dateRange' as FacetType,
          facetResponseBuilder: buildMockCommerceDateFacetResponse,
        },
        // TODO: { type: 'hierarchical' as FacetType, facetResponseBuilder: buildMockCommerceCategoryFacetResponse, },
      ])(
        'for $type facets',
        ({
          type,
          facetResponseBuilder,
        }: {
          type: FacetType;
          facetResponseBuilder: Function;
        }) => {
          it('sets #preventAutoSelect to false', () => {
            state[facetId] = buildMockCommerceFacetSlice({
              request: buildMockCommerceFacetRequest({
                type,
                preventAutoSelect: true,
              }),
            });

            const facet = facetResponseBuilder({
              facetId,
            });
            const action = buildQueryAction([facet]);

            const finalState = commerceFacetSetReducer(state, action);
            expect(finalState[facetId]?.request.preventAutoSelect).toBe(false);
          });

          it('response containing unregistered facet ids does not throw', () => {
            const facet = facetResponseBuilder({
              facetId,
            });
            const action = buildQueryAction([facet]);

            expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
          });

          it('removes facets not in response', () => {
            const facetIdToRemove = 'facet-to-remove';
            const newFacetId = 'new-facet';
            state[facetIdToRemove] = buildMockCommerceFacetSlice({
              request: buildMockCommerceFacetRequest({type}),
            });

            const newFacet = facetResponseBuilder({
              facetId: newFacetId,
            });
            const action = buildQueryAction([newFacet]);

            const finalState = commerceFacetSetReducer(state, action);
            expect(facetIdToRemove in finalState).toBe(false);
            expect(newFacetId in finalState).toBe(true);
          });
        }
      );
    }
  );

  describe('for regular facets', () => {
    describe.each([
      {
        title: 'dispatching #toggleSelectFacetValue with a registered facet id',
        facetValueState: 'selected' as FacetValueState,
        toggleAction: toggleSelectFacetValue,
      },
      {
        title:
          'dispatching #toggleExcludeFacetValue with a registered facet id',
        facetValueState: 'excluded' as FacetValueState,
        toggleAction: toggleExcludeFacetValue,
      },
    ])(
      '$title',
      ({
        facetValueState,
        toggleAction,
      }: {
        facetValueState: FacetValueState;
        toggleAction: Function;
      }) => {
        const facetId = '1';
        const oppositeFacetValueState = facetValueStates.find(
          (valueState) => ![facetValueState, 'idle'].includes(valueState)
        );
        describe('when the facet value exists', () => {
          it(`sets the state of an idle value to ${facetValueState}`, () => {
            const facetValue = buildMockCommerceRegularFacetValue({
              value: 'TED',
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

            const targetValue = (
              finalState[facetId]?.request.values as FacetValueRequest[]
            ).find((req) => req.value === facetValue.value);
            expect(targetValue?.state).toBe(facetValueState);
          });

          it(`sets the state of an ${oppositeFacetValueState} value to ${facetValueState}`, () => {
            const facetValue = buildMockCommerceRegularFacetValue({
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

            const targetValue = (
              finalState[facetId]?.request.values as FacetValueRequest[]
            ).find((req) => req.value === facetValue.value);
            expect(targetValue?.state).toBe(facetValueState);
          });

          it(`sets the state of a ${facetValueState} value to idle`, () => {
            const facetValue = buildMockCommerceRegularFacetValue({
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

            const targetValue = (
              finalState[facetId]?.request.values as FacetValueRequest[]
            ).find((req) => req.value === facetValue.value);
            expect(targetValue?.state).toBe('idle');
          });

          it('sets #preventAutoSelect to true', () => {
            const facetValue = buildMockCommerceRegularFacetValue({
              value: 'TED',
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
          ({
            facetValueState,
            toggleAction,
          }: {
            facetValueState: FacetValueState;
            toggleAction: Function;
          }) => {
            it('replaces the first idle value with the new value', () => {
              const newFacetValue = buildMockCommerceRegularFacetValue({
                value: 'TED',
                state: facetValueState,
              });

              state[facetId] = buildMockCommerceFacetSlice({
                request: buildMockCommerceFacetRequest({
                  values: [
                    buildMockCommerceRegularFacetValue({
                      value: 'active1',
                      state: facetValueState,
                    }),
                    buildMockCommerceRegularFacetValue({
                      value: 'active2',
                      state: facetValueState,
                    }),
                    buildMockCommerceRegularFacetValue({
                      value: 'idle1',
                      state: 'idle',
                    }),
                    buildMockCommerceRegularFacetValue({
                      value: 'idle2',
                      state: 'idle',
                    }),
                  ],
                }),
              });

              const action = toggleAction({
                facetId,
                selection: newFacetValue,
              });

              const finalState = commerceFacetSetReducer(state, action);
              expect(
                (
                  finalState[facetId]?.request.values as FacetValueRequest[]
                ).indexOf(newFacetValue)
              ).toBe(2);
              expect(finalState[facetId]?.request.values.length).toBe(4);
            });

            it('sets #preventAutoSelect to true', () => {
              state[facetId] = buildMockCommerceFacetSlice({
                request: buildMockCommerceFacetRequest({values: []}),
              });

              const action = toggleAction({
                facetId,
                selection: buildMockCommerceRegularFacetValue({value: 'TED'}),
              });
              const finalState = commerceFacetSetReducer(state, action);

              expect(finalState[facetId]?.request.preventAutoSelect).toBe(true);
            });
          }
        );
      }
    );
    it('dispatching #toggleSelectFacetValue with an invalid id does not throw', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      const action = toggleSelectFacetValue({
        facetId: '1',
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('dispatching #toggleSelectFacetValue with an invalid facet type does not throw', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      const facet = buildMockCommerceFacetRequest({
        type: 'numericalRange',
        values: [facetValue],
      });
      state[facet.facetId] = buildMockCommerceFacetSlice({
        request: facet,
      });
      const action = toggleSelectFacetValue({
        facetId: facet.facetId,
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('dispatching #toggleExcludeFacetValue with an invalid id does not throw', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      const action = toggleExcludeFacetValue({
        facetId: '1',
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('dispatching #toggleExcludeFacetValue with an invalid facet type does not throw', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      const facet = buildMockCommerceFacetRequest({
        type: 'numericalRange',
        values: [facetValue],
      });
      state[facet.facetId] = buildMockCommerceFacetSlice({
        request: facet,
      });
      const action = toggleExcludeFacetValue({
        facetId: facet.facetId,
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });
  });

  describe('for numericalRange facets', () => {
    describe.each([
      {
        title:
          'dispatching #toggleSelectNumericFacetValue with a registered facet id',
        facetValueState: 'selected' as FacetValueState,
        toggleAction: toggleSelectNumericFacetValue,
      },
      {
        title:
          'dispatching #toggleExcludeNumericFacetValue with a registered facet id',
        facetValueState: 'excluded' as FacetValueState,
        toggleAction: toggleExcludeNumericFacetValue,
      },
    ])(
      '$title',
      ({
        facetValueState,
        toggleAction,
      }: {
        facetValueState: FacetValueState;
        toggleAction: ActionCreator;
      }) => {
        const facetId = '1';
        const oppositeFacetValueState = facetValueStates.find(
          (valueState) => ![facetValueState, 'idle'].includes(valueState)
        );
        describe('when the facet value exists', () => {
          it(`sets the state of an idle value to ${facetValueState}`, () => {
            const facetValue = buildMockCommerceNumericFacetValue({
              start: 0,
              end: 5,
              endInclusive: true,
            });
            const facetValueRequests = convertToNumericRangeRequests([
              facetValue,
            ]);

            state[facetId] = buildMockCommerceFacetSlice({
              request: buildMockCommerceFacetRequest({
                type: 'numericalRange',
                values: facetValueRequests,
              }),
            });

            const action = toggleAction({
              facetId,
              selection: facetValue,
            });
            const finalState = commerceFacetSetReducer(state, action);

            const targetValue = findExactRangeValue(
              finalState[facetId]?.request.values as NumericRangeRequest[],
              facetValue
            );
            expect(targetValue?.state).toBe(facetValueState);
          });

          it(`sets the state of an ${oppositeFacetValueState} value to ${facetValueState}`, () => {
            const facetValue = buildMockCommerceNumericFacetValue({
              start: 0,
              end: 5,
              endInclusive: true,
              state: oppositeFacetValueState,
            });
            const facetValueRequests = convertToNumericRangeRequests([
              facetValue,
            ]);

            state[facetId] = buildMockCommerceFacetSlice({
              request: buildMockCommerceFacetRequest({
                type: 'numericalRange',
                values: facetValueRequests,
              }),
            });

            const action = toggleAction({
              facetId,
              selection: facetValue,
            });
            const finalState = commerceFacetSetReducer(state, action);

            const targetValue = findExactRangeValue(
              finalState[facetId]?.request.values as NumericRangeRequest[],
              facetValue
            );
            expect(targetValue?.state).toBe(facetValueState);
          });

          it(`sets the state of a ${facetValueState} value to idle`, () => {
            const facetValue = buildMockCommerceNumericFacetValue({
              start: 0,
              end: 5,
              endInclusive: true,
              state: facetValueState,
            });
            const facetValueRequests = convertToNumericRangeRequests([
              facetValue,
            ]);

            state[facetId] = buildMockCommerceFacetSlice({
              request: buildMockCommerceFacetRequest({
                type: 'numericalRange',
                values: facetValueRequests,
              }),
            });

            const action = toggleAction({
              facetId,
              selection: facetValue,
            });
            const finalState = commerceFacetSetReducer(state, action);

            const targetValue = findExactRangeValue(
              finalState[facetId]?.request.values as NumericRangeRequest[],
              facetValue
            );
            expect(targetValue?.state).toBe('idle');
          });

          it('sets #preventAutoSelect to true', () => {
            const facetValue = buildMockCommerceNumericFacetValue({
              start: 0,
              end: 5,
              endInclusive: true,
            });
            const facetValueRequests = convertToNumericRangeRequests([
              facetValue,
            ]);

            state[facetId] = buildMockCommerceFacetSlice({
              request: buildMockCommerceFacetRequest({
                type: 'numericalRange',
                values: facetValueRequests,
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
            toggleAction: toggleSelectNumericFacetValue,
          },
          {
            facetValueState: 'excluded' as FacetValueState,
            toggleAction: toggleExcludeNumericFacetValue,
          },
        ])(
          'when the facet value does not exist',
          ({
            facetValueState,
            toggleAction,
          }: {
            facetValueState: FacetValueState;
            toggleAction: Function;
          }) => {
            it('replaces the first idle value with the new value', () => {
              const newFacetValue = buildMockCommerceNumericFacetValue({
                start: 0,
                end: 5,
                endInclusive: true,
                state: facetValueState,
              });

              state[facetId] = buildMockCommerceFacetSlice({
                request: buildMockCommerceFacetRequest({
                  type: 'numericalRange',
                  values: [
                    buildMockCommerceNumericFacetValue({
                      start: 6,
                      end: 10,
                      endInclusive: true,
                      state: facetValueState,
                    }),
                    buildMockCommerceNumericFacetValue({
                      start: 11,
                      end: 15,
                      endInclusive: true,
                      state: facetValueState,
                    }),
                    buildMockCommerceNumericFacetValue({
                      start: 16,
                      end: 20,
                      endInclusive: true,
                      state: 'idle',
                    }),
                    buildMockCommerceNumericFacetValue({
                      start: 21,
                      end: 25,
                      endInclusive: true,
                      state: 'idle',
                    }),
                  ],
                }),
              });

              const action = toggleAction({
                facetId,
                selection: newFacetValue,
              });

              const finalState = commerceFacetSetReducer(state, action);
              expect(
                (
                  finalState[facetId]?.request.values as NumericRangeRequest[]
                ).indexOf(newFacetValue)
              ).toBe(2);
              expect(finalState[facetId]?.request.values.length).toBe(4);
            });

            it('sets #preventAutoSelect to true', () => {
              state[facetId] = buildMockCommerceFacetSlice({
                request: buildMockCommerceFacetRequest({
                  type: 'numericalRange',
                  values: [],
                }),
              });

              const action = toggleAction({
                facetId,
                selection: buildMockCommerceNumericFacetValue({
                  start: 0,
                  end: 5,
                  endInclusive: true,
                }),
              });
              const finalState = commerceFacetSetReducer(state, action);

              expect(finalState[facetId]?.request.preventAutoSelect).toBe(true);
            });
          }
        );
      }
    );
    it('dispatching #toggleSelectNumericFacetValue with an invalid id does not throw', () => {
      const facetValue = buildMockCommerceNumericFacetValue();
      const action = toggleSelectNumericFacetValue({
        facetId: '1',
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('dispatching #toggleSelectNumericFacetValue with an invalid facet type does not throw', () => {
      const facetValue = buildMockCommerceNumericFacetValue();
      const facet = buildMockCommerceFacetRequest({
        type: 'regular',
        values: [facetValue],
      });
      state[facet.facetId] = buildMockCommerceFacetSlice({
        request: facet,
      });
      const action = toggleSelectNumericFacetValue({
        facetId: facet.facetId,
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('dispatching #toggleExcludeNumericFacetValue with an invalid id does not throw', () => {
      const facetValue = buildMockCommerceNumericFacetValue();
      const action = toggleExcludeNumericFacetValue({
        facetId: '1',
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('dispatching #toggleExcludeNumericFacetValue with an invalid facet type does not throw', () => {
      const facetValue = buildMockCommerceNumericFacetValue();
      const facet = buildMockCommerceFacetRequest({
        type: 'regular',
        values: [facetValue],
      });
      state[facet.facetId] = buildMockCommerceFacetSlice({
        request: facet,
      });
      const action = toggleExcludeNumericFacetValue({
        facetId: facet.facetId,
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });
  });

  describe('for dateRange facets', () => {
    describe.each([
      {
        title:
          'dispatching #toggleSelectDateFacetValue with a registered facet id',
        facetValueState: 'selected' as FacetValueState,
        toggleAction: toggleSelectDateFacetValue,
      },
      {
        title:
          'dispatching #toggleExcludeDateFacetValue with a registered facet id',
        facetValueState: 'excluded' as FacetValueState,
        toggleAction: toggleExcludeDateFacetValue,
      },
    ])(
      '$title',
      ({
        facetValueState,
        toggleAction,
      }: {
        facetValueState: FacetValueState;
        toggleAction: Function;
      }) => {
        const facetId = '1';
        const oppositeFacetValueState = facetValueStates.find(
          (valueState) => ![facetValueState, 'idle'].includes(valueState)
        );
        describe('when the facet value exists', () => {
          it(`sets the state of an idle value to ${facetValueState}`, () => {
            const facetValue = buildMockCommerceDateFacetValue({
              start: '2023-01-01',
              end: '2024-01-01',
              endInclusive: true,
            });
            const facetValueRequests = convertToDateRangeRequests([facetValue]);

            state[facetId] = buildMockCommerceFacetSlice({
              request: buildMockCommerceFacetRequest({
                type: 'dateRange',
                values: facetValueRequests,
              }),
            });

            const action = toggleAction({
              facetId,
              selection: facetValue,
            });
            const finalState = commerceFacetSetReducer(state, action);

            const targetValue = findExactRangeValue(
              finalState[facetId]?.request.values as DateRangeRequest[],
              facetValue
            );
            expect(targetValue?.state).toBe(facetValueState);
          });

          it(`sets the state of an ${oppositeFacetValueState} value to ${facetValueState}`, () => {
            const facetValue = buildMockCommerceDateFacetValue({
              start: '2023-01-01',
              end: '2024-01-01',
              endInclusive: true,
              state: oppositeFacetValueState,
            });
            const facetValueRequests = convertToDateRangeRequests([facetValue]);

            state[facetId] = buildMockCommerceFacetSlice({
              request: buildMockCommerceFacetRequest({
                type: 'dateRange',
                values: facetValueRequests,
              }),
            });

            const action = toggleAction({
              facetId,
              selection: facetValue,
            });
            const finalState = commerceFacetSetReducer(state, action);

            const targetValue = findExactRangeValue(
              finalState[facetId]?.request.values as DateRangeRequest[],
              facetValue
            );
            expect(targetValue?.state).toBe(facetValueState);
          });

          it(`sets the state of a ${facetValueState} value to idle`, () => {
            const facetValue = buildMockCommerceDateFacetValue({
              start: '2023-01-01',
              end: '2024-01-01',
              endInclusive: true,
              state: facetValueState,
            });
            const facetValueRequests = convertToDateRangeRequests([facetValue]);

            state[facetId] = buildMockCommerceFacetSlice({
              request: buildMockCommerceFacetRequest({
                type: 'dateRange',
                values: facetValueRequests,
              }),
            });

            const action = toggleAction({
              facetId,
              selection: facetValue,
            });
            const finalState = commerceFacetSetReducer(state, action);

            const targetValue = findExactRangeValue(
              finalState[facetId]?.request.values as DateRangeRequest[],
              facetValue
            );
            expect(targetValue?.state).toBe('idle');
          });

          it('sets #preventAutoSelect to true', () => {
            const facetValue = buildMockCommerceDateFacetValue({
              start: '2023-01-01',
              end: '2024-01-01',
              endInclusive: true,
            });
            const facetValueRequests = convertToDateRangeRequests([facetValue]);

            state[facetId] = buildMockCommerceFacetSlice({
              request: buildMockCommerceFacetRequest({
                type: 'dateRange',
                values: facetValueRequests,
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
            toggleAction: toggleSelectDateFacetValue,
          },
          {
            facetValueState: 'excluded' as FacetValueState,
            toggleAction: toggleExcludeDateFacetValue,
          },
        ])(
          'when the facet value does not exist',
          ({
            facetValueState,
            toggleAction,
          }: {
            facetValueState: FacetValueState;
            toggleAction: ActionCreator;
          }) => {
            it('replaces the first idle value with the new value', () => {
              const newFacetValue = buildMockCommerceDateFacetValue({
                start: '2023-01-01',
                end: '2024-01-01',
                endInclusive: false,
                state: facetValueState,
              });

              state[facetId] = buildMockCommerceFacetSlice({
                request: buildMockCommerceFacetRequest({
                  type: 'dateRange',
                  values: [
                    buildMockCommerceDateFacetValue({
                      start: '2024-01-01',
                      end: '2025-01-01',
                      endInclusive: false,
                      state: facetValueState,
                    }),
                    buildMockCommerceDateFacetValue({
                      start: '2025-01-01',
                      end: '2026-01-01',
                      endInclusive: false,
                      state: facetValueState,
                    }),
                    buildMockCommerceDateFacetValue({
                      start: '2026-01-01',
                      end: '2027-01-01',
                      endInclusive: false,
                      state: 'idle',
                    }),
                    buildMockCommerceDateFacetValue({
                      start: '2027-01-01',
                      end: '2028-01-01',
                      endInclusive: true,
                      state: 'idle',
                    }),
                  ],
                }),
              });

              const action = toggleAction({
                facetId,
                selection: newFacetValue,
              });

              const finalState = commerceFacetSetReducer(state, action);
              expect(
                (
                  finalState[facetId]?.request.values as DateRangeRequest[]
                ).indexOf(newFacetValue)
              ).toBe(2);
              expect(finalState[facetId]?.request.values.length).toBe(4);
            });

            it('sets #preventAutoSelect to true', () => {
              state[facetId] = buildMockCommerceFacetSlice({
                request: buildMockCommerceFacetRequest({
                  type: 'dateRange',
                  values: [],
                }),
              });

              const action = toggleAction({
                facetId,
                selection: buildMockCommerceDateFacetValue({
                  start: '2023-01-01',
                  end: '2024-01-01',
                  endInclusive: false,
                }),
              });
              const finalState = commerceFacetSetReducer(state, action);

              expect(finalState[facetId]?.request.preventAutoSelect).toBe(true);
            });
          }
        );
      }
    );

    it('dispatching #toggleSelectDateFacetValue with an invalid id does not throw', () => {
      const facetValue = buildMockCommerceDateFacetValue();
      const action = toggleSelectDateFacetValue({
        facetId: '1',
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('dispatching #toggleSelectDateFacetValue with an invalid facet type does not throw', () => {
      const facetValue = buildMockCommerceDateFacetValue();
      const facet = buildMockCommerceFacetRequest({
        type: 'regular',
        values: [facetValue],
      });
      state[facet.facetId] = buildMockCommerceFacetSlice({
        request: facet,
      });
      const action = toggleSelectDateFacetValue({
        facetId: facet.facetId,
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('dispatching #toggleExcludeDateFacetValue with an invalid id does not throw', () => {
      const facetValue = buildMockCommerceDateFacetValue();
      const action = toggleExcludeDateFacetValue({
        facetId: '1',
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('dispatching #toggleExcludeDateFacetValue with an invalid facet type does not throw', () => {
      const facetValue = buildMockCommerceDateFacetValue();
      const facet = buildMockCommerceFacetRequest({
        type: 'regular',
        values: [facetValue],
      });
      state[facet.facetId] = buildMockCommerceFacetSlice({
        request: facet,
      });
      const action = toggleExcludeDateFacetValue({
        facetId: facet.facetId,
        selection: facetValue,
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });
  });

  // TODO describe('for hierarchical facets', () => { /* ... */ });

  describe.each([
    {
      actionToDispatch: selectFacetSearchResult,
      expectedState: 'selected' as FacetValueState,
    },
    {
      actionToDispatch: excludeFacetSearchResult,
      expectedState: 'excluded' as FacetValueState,
    },
  ])(
    'on $actionToDispatch',
    ({
      actionToDispatch,
      expectedState,
    }: {
      actionToDispatch: ActionCreator;
      expectedState: FacetValueState;
    }) => {
      it('when facet request is not found in state, does not throw', () => {
        const action = actionToDispatch({
          facetId: 'invalid!',
          value: buildMockFacetSearchResult(),
        });

        expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
      });

      it('when facet request type is invalid (i.e., is not "regular" or "hierarchical"), does not throw', () => {
        const facetId = 'date_range_facet_id';
        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            type: 'dateRange',
            values: [],
          }),
        });
        const action = actionToDispatch({
          facetId,
          value: buildMockFacetSearchResult(),
        });

        expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
      });

      it('when facet search result exists in request, updates its state to "$expectedState"', () => {
        const facetId = 'regular_facet_id';
        const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
        const facetValueRequest = convertFacetValueToRequest(facetValue);

        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            type: 'regular',
            values: [facetValueRequest],
          }),
        });

        const facetSearchResult = buildMockFacetSearchResult({
          rawValue: facetValue.value,
        });

        const action = actionToDispatch({
          facetId,
          value: facetSearchResult,
        });
        const finalState = commerceFacetSetReducer(state, action);

        const targetValue = (
          finalState[facetId]?.request.values as FacetValueRequest[]
        ).find((req) => req.value === facetValue.value);
        expect(targetValue?.state).toBe(expectedState);
      });

      it('when facet search result does not exist in facet request, creates it and sets its state to "$expectedState"', () => {
        const facetId = 'regular_facet_id';

        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            type: 'regular',
            values: [],
          }),
        });

        const rawValue = 'TED';

        const facetSearchResult = buildMockFacetSearchResult({
          rawValue,
        });

        const action = actionToDispatch({
          facetId,
          value: facetSearchResult,
        });
        const finalState = commerceFacetSetReducer(state, action);

        const targetValue = (
          finalState[facetId]?.request.values as FacetValueRequest[]
        ).find((req) => req.value === rawValue);
        expect(targetValue?.state).toBe(expectedState);
      });
    }
  );

  describe('#updateFacetIsFieldExpanded', () => {
    describe.each([
      {
        type: 'regular' as FacetType,
      },
      {
        type: 'numericalRange' as FacetType,
      },
      {
        type: 'dateRange' as FacetType,
      },
      // TODO: { type: 'hierarchical' as FacetType },
    ])('for $type facets', ({type}: {type: FacetType}) => {
      it('dispatching with a registered facet id updates the value', () => {
        const facetId = '1';
        const isFieldExpanded = true;
        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            type,
            isFieldExpanded: !isFieldExpanded,
          }),
        });

        const action = updateFacetIsFieldExpanded({facetId, isFieldExpanded});
        const finalState = commerceFacetSetReducer(state, action);

        expect(finalState[facetId]?.request.isFieldExpanded).toBe(
          isFieldExpanded
        );
      });
    });
    it('dispatching with an unregistered id does not throw', () => {
      const action = updateFacetIsFieldExpanded({
        facetId: '1',
        isFieldExpanded: true,
      });
      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });
  });

  it('#updateFacetAutoSelection updates autoSelection for all facets', () => {
    const facetId = '1';
    const anotherFacetId = '2';
    state[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({preventAutoSelect: true}),
    });
    state[anotherFacetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({preventAutoSelect: true}),
    });

    const finalState = commerceFacetSetReducer(
      state,
      updateFacetAutoSelection({allow: true})
    );

    expect(finalState[facetId]!.request.preventAutoSelect).toBe(false);
    expect(finalState[anotherFacetId]!.request.preventAutoSelect).toBe(false);
  });

  describe.each([
    {
      actionName: '#deselectAllBreadcrumbs',
      action: deselectAllBreadcrumbs,
    },
    {
      actionName: '#setContext',
      action: setContext,
    },
    {
      actionName: '#setView',
      action: setView,
    },
    {
      actionName: '#setUser',
      action: setUser,
    },
  ])('$actionName', ({action}: {action: ActionCreator}) => {
    const facetId = '1';

    it('resets facets', () => {
      state[facetId] = buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest({
          type: 'regular',
          facetId,
          values: [{value: 'facet value', state: 'selected'}],
        }),
      });

      const finalState = commerceFacetSetReducer(state, action({}));

      expect(finalState[facetId].request.values[0].state).toEqual('idle');
    });
  });
});
