import {Action} from '@reduxjs/toolkit';
import {
  DateRangeRequest,
  FacetValueRequest,
  NumericRangeRequest,
} from '../../../../controllers/commerce/core/facets/headless-core-commerce-facet';
import {buildMockCategoryFacetSearchResult} from '../../../../test/mock-category-facet-search-result';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {
  buildMockCategoryFacetResponse,
  buildMockCommerceDateFacetResponse,
  buildMockCommerceNumericFacetResponse,
  buildMockCommerceRegularFacetResponse,
} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {
  buildMockCategoryFacetValue,
  buildMockCommerceDateFacetValue,
  buildMockCommerceNumericFacetValue,
  buildMockCommerceRegularFacetValue,
} from '../../../../test/mock-commerce-facet-value';
import {buildSearchResponse} from '../../../../test/mock-commerce-search';
import {buildMockFacetSearchResult} from '../../../../test/mock-facet-search-result';
import {buildFetchProductListingV2Response} from '../../../../test/mock-product-listing-v2';
import {deselectAllBreadcrumbs} from '../../../breadcrumb/breadcrumb-actions';
import {
  defaultNumberOfValuesIncrement,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../facets/category-facet-set/category-facet-set-actions';
import {
  FacetValueState,
  facetValueStates,
} from '../../../facets/facet-api/value';
import {selectCategoryFacetSearchResult} from '../../../facets/facet-search-set/category/category-facet-search-actions';
import {
  excludeFacetSearchResult,
  selectFacetSearchResult,
} from '../../../facets/facet-search-set/specific/specific-facet-search-actions';
import {
  deselectAllFacetValues,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
} from '../../../facets/facet-set/facet-set-actions';
import {convertFacetValueToRequest} from '../../../facets/facet-set/facet-set-slice';
import {updateFacetAutoSelection} from '../../../facets/generic/facet-actions';
import * as FacetReducers from '../../../facets/generic/facet-reducer-helpers';
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
import * as CommerceFacetReducers from './facet-set-reducer-helpers';
import {
  commerceFacetSetReducer,
  convertCategoryFacetValueToRequest,
} from './facet-set-slice';
import {
  CommerceFacetSetState,
  getCommerceFacetSetInitialState,
} from './facet-set-state';
import {CategoryFacetValueRequest} from './interfaces/request';
import {
  AnyFacetResponse,
  CategoryFacetValue,
  FacetType,
} from './interfaces/response';

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

      it('when a previously registered facet is not found in the response, removes that facet from the state', () => {
        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({facetId}),
        });

        const action = buildQueryAction([]);
        const finalState = commerceFacetSetReducer(state, action);

        expect(finalState[facetId]).toBeUndefined();
      });

      describe('when a facet is found in the response', () => {
        describe('when found facet is not already registered in the state', () => {
          it('registers the facet in the state', () => {
            const facet = buildMockCommerceRegularFacetResponse({
              facetId,
            });

            const action = buildQueryAction([facet]);
            const finalState = commerceFacetSetReducer(state, action);

            expect(finalState[facetId]).toBeDefined();
          });
          it('sets the facet #initialNumberOfResults to #numberOfValues from facet response', () => {
            const facet = buildMockCommerceRegularFacetResponse({
              facetId,
              numberOfValues: 5,
            });

            const action = buildQueryAction([facet]);
            const finalState = commerceFacetSetReducer(state, action);

            expect(finalState[facetId]?.request.initialNumberOfValues).toEqual(
              5
            );
          });
        });

        it('when found facet is already registered in the state, does not update the facet #initialNumberOfResults in the state', () => {
          state[facetId] = buildMockCommerceFacetSlice({
            request: buildMockCommerceFacetRequest({
              type: 'regular',
              facetId,
              initialNumberOfValues: 8,
            }),
          });

          const facet = buildMockCommerceRegularFacetResponse({
            facetId,
            numberOfValues: 2,
          });

          const action = buildQueryAction([facet]);
          const finalState = commerceFacetSetReducer(state, action);

          expect(finalState[facetId]?.request.initialNumberOfValues).toEqual(8);
        });

        it('sets/updates facet request #displayName in state from response', () => {
          const facetResponse1 = buildMockCommerceRegularFacetResponse({
            facetId,
            displayName: 'original display name',
          });

          const action1 = buildQueryAction([facetResponse1]);
          const updatedState1 = commerceFacetSetReducer(state, action1);

          expect(updatedState1[facetId]?.request.displayName).toEqual(
            facetResponse1.displayName
          );

          const facetResponse2 = buildMockCommerceRegularFacetResponse({
            facetId,
            displayName: 'new display name',
          });

          const action2 = buildQueryAction([facetResponse2]);
          const updatedState = commerceFacetSetReducer(state, action2);

          expect(updatedState[facetId]?.request.displayName).toEqual(
            facetResponse2.displayName
          );
        });

        it('sets/updates facet request #field in state from response', () => {
          const field1 = 'original field';
          const facetResponse1 = buildMockCommerceRegularFacetResponse({
            facetId,
            field: field1,
          });

          const action1 = buildQueryAction([facetResponse1]);
          const updatedState1 = commerceFacetSetReducer(state, action1);

          expect(updatedState1[facetId]?.request.field).toEqual(field1);

          const field2 = 'new field';

          const facetResponse2 = buildMockCommerceRegularFacetResponse({
            facetId,
            field: field2,
          });

          const action2 = buildQueryAction([facetResponse2]);
          const updatedState2 = commerceFacetSetReducer(state, action2);

          expect(updatedState2[facetId]?.request.field).toEqual(field2);
        });

        it('sets/updates facet request #numberOfValues in state from #numberOfValues in response', () => {
          const facetResponse1 = buildMockCommerceRegularFacetResponse({
            facetId,
            numberOfValues: 1,
          });

          const action1 = buildQueryAction([facetResponse1]);
          const updatedState1 = commerceFacetSetReducer(state, action1);

          expect(updatedState1[facetId]?.request.numberOfValues).toEqual(1);

          const facetResponse2 = buildMockCommerceRegularFacetResponse({
            facetId,
            numberOfValues: 3,
          });

          const action2 = buildQueryAction([facetResponse2]);
          const updatedState2 = commerceFacetSetReducer(state, action2);

          expect(updatedState2[facetId]?.request.numberOfValues).toEqual(3);
        });

        it('sets/updates #type in state from response', () => {
          const facetResponse1 = buildMockCommerceRegularFacetResponse({
            facetId,
          });

          const action1 = buildQueryAction([facetResponse1]);
          const updatedState1 = commerceFacetSetReducer(state, action1);

          expect(updatedState1[facetId]?.request.type).toEqual('regular');

          const facetResponse2 = buildMockCommerceDateFacetResponse({
            facetId,
          });

          const action2 = buildQueryAction([facetResponse2]);
          const updatedState2 = commerceFacetSetReducer(state, action2);

          expect(updatedState2[facetId]?.request.type).toEqual('dateRange');
        });

        it('when found facet #type is "hierarchical", sets/updates #delimitingCharacter in state from response', () => {
          const delimitingCharacter1 = '>';
          const facetResponse1 = buildMockCategoryFacetResponse({
            facetId,
            delimitingCharacter: delimitingCharacter1,
          });

          const action1 = buildQueryAction([facetResponse1]);
          const initialState = commerceFacetSetReducer(state, action1);

          expect(initialState[facetId]?.request.delimitingCharacter).toEqual(
            delimitingCharacter1
          );

          const delimitingCharacter2 = '|';
          const facetResponse2 = buildMockCategoryFacetResponse({
            facetId,
            delimitingCharacter: delimitingCharacter2,
          });

          const action2 = buildQueryAction([facetResponse2]);
          const updatedState = commerceFacetSetReducer(state, action2);

          expect(updatedState[facetId]?.request.delimitingCharacter).toEqual(
            delimitingCharacter2
          );
        });

        it('when found facet #type is "regular", sets/updates #values in state from response', () => {
          const facetValue1 = buildMockCommerceRegularFacetValue({
            value: 'TED',
          });
          const facetResponse1 = buildMockCommerceRegularFacetResponse({
            facetId,
            values: [facetValue1],
          });

          const action1 = buildQueryAction([facetResponse1]);
          const updatedState1 = commerceFacetSetReducer(state, action1);

          const expectedFacetValueRequest1 =
            convertFacetValueToRequest(facetValue1);
          expect(updatedState1[facetId]?.request.values).toEqual([
            expectedFacetValueRequest1,
          ]);

          const facetValue2 = buildMockCommerceRegularFacetValue({
            value: 'BILL',
          });
          const facetResponse2 = buildMockCommerceRegularFacetResponse({
            facetId,
            values: [facetValue2],
          });

          state[facetId] = buildMockCommerceFacetSlice({
            request: buildMockCommerceFacetRequest({type: 'regular', facetId}),
          });

          const action2 = buildQueryAction([facetResponse2]);
          const updatedState2 = commerceFacetSetReducer(state, action2);

          const expectedFacetValueRequest2 =
            convertFacetValueToRequest(facetValue2);
          expect(updatedState2[facetId]?.request.values).toEqual([
            expectedFacetValueRequest2,
          ]);
        });

        it('when found facet #type is "numericalRange", sets/updates #values in facet state from response', () => {
          const facetValue1 = buildMockCommerceNumericFacetValue({
            start: 0,
            end: 5,
          });
          const facetResponse1 = buildMockCommerceNumericFacetResponse({
            facetId,
            values: [facetValue1],
          });

          const action1 = buildQueryAction([facetResponse1]);
          const state1 = commerceFacetSetReducer(state, action1);

          const expectedFacetValueRequests1 = convertToNumericRangeRequests([
            facetValue1,
          ]);
          expect(state1[facetId]?.request.values).toEqual(
            expectedFacetValueRequests1
          );

          const facetValue2 = buildMockCommerceNumericFacetValue({
            start: 5,
            end: 10,
          });
          const facetResponse2 = buildMockCommerceNumericFacetResponse({
            facetId,
            values: [facetValue2],
          });

          const action2 = buildQueryAction([facetResponse2]);
          const state2 = commerceFacetSetReducer(state, action2);

          const expectedFacetValueRequests2 = convertToNumericRangeRequests([
            facetValue2,
          ]);
          expect(state2[facetId]?.request.values).toEqual(
            expectedFacetValueRequests2
          );
        });

        it('when found facet #type is "dateRange", sets/updates #values in request from response', () => {
          const facetValue1 = buildMockCommerceDateFacetValue({
            start: '2023-01-01',
            end: '2024-01-01',
          });
          const facetResponse1 = buildMockCommerceDateFacetResponse({
            facetId,
            values: [facetValue1],
          });

          const action1 = buildQueryAction([facetResponse1]);
          const updatedState1 = commerceFacetSetReducer(state, action1);

          const expectedFacetValueRequests1 = convertToDateRangeRequests([
            facetValue1,
          ]);
          expect(updatedState1[facetId]?.request.values).toEqual(
            expectedFacetValueRequests1
          );

          const facetValue2 = buildMockCommerceDateFacetValue({
            start: '2024-01-01',
            end: '2025-01-01',
          });
          const facetResponse2 = buildMockCommerceDateFacetResponse({
            facetId,
            values: [facetValue2],
          });

          const action2 = buildQueryAction([facetResponse2]);
          const updatedState2 = commerceFacetSetReducer(state, action2);

          const expectedFacetValueRequests2 = convertToDateRangeRequests([
            facetValue2,
          ]);
          expect(updatedState2[facetId]?.request.values).toEqual(
            expectedFacetValueRequests2
          );
        });

        it('when found facet #type is "hierarchical", sets/updates #values in state from response', () => {
          const facetValue1 = buildMockCategoryFacetValue({
            path: ['Food'],
            value: 'Food',
            children: [
              buildMockCategoryFacetValue({
                path: ['Food', 'Burgers'],
                value: 'Burgers',
              }),
            ],
          });
          const facetResponse1 = buildMockCategoryFacetResponse({
            facetId,
            values: [facetValue1],
          });

          const action1 = buildQueryAction([facetResponse1]);
          const updatedState1 = commerceFacetSetReducer(state, action1);

          const expectedFacetValueRequests1 = [
            convertCategoryFacetValueToRequest(facetValue1),
          ];
          expect(updatedState1[facetId]?.request.values).toEqual(
            expectedFacetValueRequests1
          );

          const facetValue2 = buildMockCategoryFacetValue({
            path: ['Beverages'],
            value: 'Beverages',
            children: [
              buildMockCategoryFacetValue({
                path: ['Beverages', 'Soft drinks'],
                value: 'Soft drinks',
              }),
            ],
          });
          const facetResponse2 = buildMockCategoryFacetResponse({
            facetId,
            values: [facetValue2],
          });

          const action2 = buildQueryAction([facetResponse2]);
          const updatedState2 = commerceFacetSetReducer(state, action2);

          const expectedFacetValueRequests2 = [
            convertCategoryFacetValueToRequest(facetValue2),
          ];
          expect(updatedState2[facetId]?.request.values).toEqual(
            expectedFacetValueRequests2
          );
        });
      });

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
        {
          type: 'hierarchical' as FacetType,
          facetResponseBuilder: buildMockCategoryFacetResponse,
        },
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

  describe('for category facets', () => {
    let facetId: string;

    beforeEach(() => {
      facetId = 'category_facet_id';
    });

    describe('#toggleSelectCategoryFacetValue', () => {
      describe('when called on an unregistered #facetId', () => {
        it('does not throw', () => {
          const selection = buildMockCategoryFacetValue({value: 'A'});
          const action = toggleSelectCategoryFacetValue({
            facetId,
            selection,
            retrieveCount: 6,
          });

          expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
        });
      });

      describe('when #values is empty', () => {
        beforeEach(() => {
          const request = buildMockCommerceFacetRequest({
            type: 'hierarchical',
            values: [],
            numberOfValues: 5,
          });
          state[facetId] = buildMockCommerceFacetSlice({request});
        });

        it('builds request from selection and adds it to #values', () => {
          const selection = buildMockCategoryFacetValue({
            value: 'A',
            path: ['A'],
          });
          const action = toggleSelectCategoryFacetValue({
            facetId,
            selection,
            retrieveCount: 6,
          });
          const finalState = commerceFacetSetReducer(state, action);
          const currentValues = finalState[facetId]?.request.values;

          expect(currentValues).toEqual([
            {
              value: selection.value,
              state: 'selected',
              children: [],
              retrieveCount: 6,
            },
          ]);
        });

        it('sets #numberOfValues of request to 1', () => {
          const selection = buildMockCategoryFacetValue({
            value: 'A',
            path: ['A'],
          });
          const action = toggleSelectCategoryFacetValue({
            facetId,
            selection,
            retrieveCount: 6,
          });

          const finalState = commerceFacetSetReducer(state, action);

          expect(finalState[facetId].request.numberOfValues).toBe(1);
        });

        describe('when #path contains multiple segments', () => {
          it('selects last segment', () => {
            const selection = buildMockCategoryFacetValue({
              value: 'B',
              path: ['A', 'B'],
            });
            const action = toggleSelectCategoryFacetValue({
              facetId,
              selection,
              retrieveCount: defaultNumberOfValuesIncrement,
            });
            const finalState = commerceFacetSetReducer(state, action);
            const currentValues = finalState[facetId].request.values;

            const parent = convertCategoryFacetValueToRequest(
              buildMockCategoryFacetValue({
                value: 'A',
                state: 'idle',
                children: [
                  buildMockCategoryFacetValue({
                    value: 'B',
                    state: 'selected',
                  }),
                ],
              })
            );

            expect(currentValues).toEqual([parent]);
          });
        });
      });

      describe('when #values contains one parent', () => {
        beforeEach(() => {
          const parent = convertCategoryFacetValueToRequest(
            buildMockCategoryFacetValue({
              value: 'A',
              state: 'selected',
            })
          );
          const request = buildMockCommerceFacetRequest({
            type: 'hierarchical',
            values: [parent],
          });

          state[facetId] = buildMockCommerceFacetSlice({request});
        });

        describe('when #path contains the parent', () => {
          let selection: CategoryFacetValue;
          let finalState: CommerceFacetSetState;
          beforeEach(() => {
            selection = buildMockCategoryFacetValue({
              value: 'B',
              path: ['A', 'B'],
            });
            const action = toggleSelectCategoryFacetValue({
              facetId,
              selection,
              retrieveCount: defaultNumberOfValuesIncrement,
            });
            finalState = commerceFacetSetReducer(state, action);
          });
          it("adds selection to parent's #children", () => {
            const expected = convertCategoryFacetValueToRequest(
              buildMockCategoryFacetValue({
                value: selection.value,
                state: 'selected',
              })
            );

            const children = (
              finalState[facetId].request.values[0] as CategoryFacetValueRequest
            ).children;
            expect(children).toEqual([expected]);
          });

          it('sets parent #state to "idle"', () => {
            expect(finalState[facetId].request.values[0].state).toBe('idle');
          });
        });

        describe('when #path does not contain the parent', () => {
          it("overwrites parent, adding selection to new parent's #children", () => {
            const selection = buildMockCategoryFacetValue({
              value: 'B',
              path: ['C', 'B'],
            });
            const action = toggleSelectCategoryFacetValue({
              facetId,
              selection,
              retrieveCount: defaultNumberOfValuesIncrement,
            });
            const finalState = commerceFacetSetReducer(state, action);

            const currentValues = finalState[facetId].request.values;

            const parent = convertCategoryFacetValueToRequest(
              buildMockCategoryFacetValue({
                value: 'C',
                state: 'idle',
                children: [
                  buildMockCategoryFacetValue({
                    value: 'B',
                    state: 'selected',
                  }),
                ],
              })
            );

            expect(currentValues).toEqual([parent]);
          });
        });
      });

      describe('when #values contains two parents', () => {
        beforeEach(() => {
          const parentB = buildMockCategoryFacetValue({value: 'B'});
          const parentA = convertCategoryFacetValueToRequest(
            buildMockCategoryFacetValue({
              value: 'A',
              children: [parentB],
            })
          );

          const request = buildMockCommerceFacetRequest({
            type: 'hierarchical',
            values: [parentA],
          });
          state[facetId] = buildMockCommerceFacetSlice({request});
        });

        describe('when #path contains both parents', () => {
          it("adds selection to second parent's #children", () => {
            const selection = buildMockCategoryFacetValue({
              value: 'C',
              path: ['A', 'B', 'C'],
            });
            const action = toggleSelectCategoryFacetValue({
              facetId,
              selection,
              retrieveCount: defaultNumberOfValuesIncrement,
            });
            const finalState = commerceFacetSetReducer(state, action);

            const expected = convertCategoryFacetValueToRequest(
              buildMockCategoryFacetValue({
                value: selection.value,
                state: 'selected',
              })
            );

            expect(
              (
                finalState[facetId].request
                  .values[0] as CategoryFacetValueRequest
              ).children[0].children
            ).toEqual([expected]);
          });
        });

        describe('when selecting a parent value', () => {
          let finalState: CommerceFacetSetState;
          beforeEach(() => {
            const selection = buildMockCategoryFacetValue({
              value: 'A',
              path: ['A'],
            });
            const action = toggleSelectCategoryFacetValue({
              facetId,
              selection,
              retrieveCount: 6,
            });
            finalState = commerceFacetSetReducer(state, action);
          });

          it("clears that parent's #children", () => {
            const parent = finalState[facetId]?.request.values[0];

            expect((parent as CategoryFacetValueRequest).children).toEqual([]);
          });

          it('sets that parent #state to "selected"', () => {
            const parent = finalState[facetId]?.request.values[0];

            expect(parent.state).toBe('selected');
          });
        });
      });

      describe('when selection is invalid', () => {
        it('dispatches an action containing an error', () => {
          const selection = buildMockCategoryFacetValue({
            value: 'A',
            children: [
              buildMockCategoryFacetValue({value: 'B'}),
              buildMockCategoryFacetValue({
                value: 'C',
                children: [
                  buildMockCategoryFacetValue({
                    value: 'D',
                    numberOfResults: -1,
                  }),
                ],
              }),
            ],
          });

          const action = toggleSelectCategoryFacetValue({
            facetId,
            selection,
            retrieveCount: 6,
          });
          expect(action.error).toBeDefined();
        });
      });
    });
    describe('#updateCategoryFacetNumberOfValues', () => {
      it('calls #handleFacetUpdateNumberOfValues if there are no nested children', () => {
        const spy = jest.spyOn(
          FacetReducers,
          'handleFacetUpdateNumberOfValues'
        );
        const request = buildMockCommerceFacetRequest({
          facetId,
          type: 'hierarchical',
        });
        state[facetId] = buildMockCommerceFacetSlice({request});

        commerceFacetSetReducer(
          state,
          updateCategoryFacetNumberOfValues({
            facetId,
            numberOfValues: 20,
          })
        );

        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('calls #handleCategoryFacetNestedNumberOfValuesUpdate if there are nested children', () => {
        const spy = jest.spyOn(
          CommerceFacetReducers,
          'handleCategoryFacetNestedNumberOfValuesUpdate'
        );
        const request = buildMockCommerceFacetRequest({
          facetId,
          type: 'hierarchical',
          values: [
            convertCategoryFacetValueToRequest(
              buildMockCategoryFacetValue({value: 'test'})
            ),
          ],
        });
        state[facetId] = buildMockCommerceFacetSlice({request});

        commerceFacetSetReducer(
          state,
          updateCategoryFacetNumberOfValues({
            facetId,
            numberOfValues: 20,
          })
        );

        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('sets correct retrieve count to the appropriate number', () => {
        const request = buildMockCommerceFacetRequest({
          type: 'hierarchical',
          values: [
            convertCategoryFacetValueToRequest(
              buildMockCategoryFacetValue({
                value: 'test',
                state: 'selected',
              })
            ),
          ],
        });

        state[facetId] = buildMockCommerceFacetSlice({request});
        const finalState = commerceFacetSetReducer(
          state,
          updateCategoryFacetNumberOfValues({facetId, numberOfValues: 10})
        );
        expect(
          (finalState[facetId]?.request.values[0] as CategoryFacetValueRequest)
            .retrieveCount
        ).toBe(10);
      });

      it('should not throw when facetId does not exist', () => {
        expect(() =>
          commerceFacetSetReducer(
            state,
            updateCategoryFacetNumberOfValues({
              facetId: 'notRegistred',
              numberOfValues: 20,
            })
          )
        ).not.toThrow();
      });
    });
  });

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

      it('when facet request type is invalid (i.e., is not "regular"), does not throw', () => {
        const facetId = 'date_range_facet_id';
        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            type: 'hierarchical',
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

  describe('#selectCategoryFacetSearchResult', () => {
    it('when facet request is not found in state, does not throw', () => {
      const action = selectCategoryFacetSearchResult({
        facetId: 'invalid!',
        value: buildMockCategoryFacetSearchResult(),
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('when facet request type is invalid (i.e., is not "hierarchical"), does not throw', () => {
      const facetId = 'regular_facet_id';
      state[facetId] = buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest({
          type: 'regular',
          values: [],
        }),
      });
      const action = selectCategoryFacetSearchResult({
        facetId,
        value: buildMockCategoryFacetSearchResult(),
      });

      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    it('when facet search result exists in request values array, updates its state to "selected"', () => {
      const facetId = 'category_facet_id';
      const facetValue = buildMockCategoryFacetValue({value: 'test'});
      const facetValueRequest = convertCategoryFacetValueToRequest(facetValue);

      state[facetId] = buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest({
          type: 'hierarchical',
          values: [facetValueRequest],
        }),
      });

      const facetSearchResult = buildMockCategoryFacetSearchResult({
        displayValue: facetValue.value,
        rawValue: facetValue.value,
      });

      const action = selectCategoryFacetSearchResult({
        facetId,
        value: facetSearchResult,
      });
      const finalState = commerceFacetSetReducer(state, action);

      const targetValue = finalState[facetId]?.request
        .values[0] as CategoryFacetValueRequest;
      expect(targetValue?.state).toBe('selected');
    });

    it('when facet search result is nested in request, updates its state to "selected"', () => {
      const facetId = 'category_facet_id';
      const nestedFacetValue = buildMockCategoryFacetValue({value: 'nested'});
      const facetValue = buildMockCategoryFacetValue({
        value: 'test',
        children: [nestedFacetValue],
      });
      const facetValueRequest = convertCategoryFacetValueToRequest(facetValue);

      state[facetId] = buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest({
          type: 'hierarchical',
          values: [facetValueRequest],
        }),
      });

      const facetSearchResult = buildMockCategoryFacetSearchResult({
        displayValue: nestedFacetValue.value,
        rawValue: nestedFacetValue.value,
        path: [facetValue.value],
      });

      const action = selectCategoryFacetSearchResult({
        facetId,
        value: facetSearchResult,
      });
      const finalState = commerceFacetSetReducer(state, action);

      const targetValue = (
        finalState[facetId]?.request.values[0] as CategoryFacetValueRequest
      ).children[0];
      expect(targetValue?.state).toBe('selected');
    });
  });

  describe('#updateFacetIsFieldExpanded', () => {
    describe.each([
      {type: 'regular' as FacetType},
      {type: 'numericalRange' as FacetType},
      {type: 'dateRange' as FacetType},
      {type: 'hierarchical' as FacetType},
    ])('for $type facets', ({type}) => {
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

  describe('#deselectAllFacetValues', () => {
    it('when called on an unregistered facet id, does not throw', () => {
      const action = deselectAllFacetValues('1');
      expect(() => commerceFacetSetReducer(state, action)).not.toThrow();
    });

    describe('when called on a hierarchical facet', () => {
      const facetId = '1';
      let finalState: CommerceFacetSetState;
      beforeEach(() => {
        state[facetId] = buildMockCommerceFacetSlice({
          request: buildMockCommerceFacetRequest({
            type: 'hierarchical',
            values: [
              buildMockCategoryFacetValue({
                state: 'idle',
                children: [buildMockCategoryFacetValue({state: 'selected'})],
              }),
            ],
            numberOfValues: 1,
            preventAutoSelect: false,
          }),
        });

        finalState = commerceFacetSetReducer(
          state,
          deselectAllFacetValues(facetId)
        );
      });
      it('sets #request.numberOfValues to 0', () => {
        expect(finalState[facetId]?.request.numberOfValues).toBe(0);
      });
      it('sets #request.values to an empty array', () => {
        expect(finalState[facetId]?.request.values).toEqual([]);
      });

      it('sets #request.preventAutoSelect to "true"', () => {
        expect(finalState[facetId]?.request.preventAutoSelect).toBe(true);
      });
    });

    it('when called on a non-hierarchical facet, sets all values to "idle"', () => {
      const facetId = '1';
      state[facetId] = buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest({
          type: 'regular',
          values: [
            buildMockCommerceRegularFacetValue({state: 'selected'}),
            buildMockCommerceRegularFacetValue({state: 'excluded'}),
          ],
        }),
      });

      const finalState = commerceFacetSetReducer(
        state,
        deselectAllFacetValues(facetId)
      );

      expect(
        finalState[facetId]?.request.values.every(
          (value) => value.state === 'idle'
        )
      ).toBe(true);
    });
  });

  it('#deselectAllBreadcrumbs resets the state of all facet values to "idle"', () => {
    const facetId = '1';
    state[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({
        type: 'regular',
        facetId,
        values: [{value: 'facet value', state: 'selected'}],
      }),
    });

    const finalState = commerceFacetSetReducer(state, deselectAllBreadcrumbs());

    expect(finalState[facetId].request.values[0].state).toEqual('idle');
  });

  describe.each([
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

    it('clears all facets values', () => {
      state[facetId] = buildMockCommerceFacetSlice({
        request: buildMockCommerceFacetRequest({
          type: 'regular',
          facetId,
          values: [{value: 'facet value', state: 'selected'}],
        }),
      });

      const finalState = commerceFacetSetReducer(state, action({}));

      expect(finalState[facetId].request.values.length).toBe(0);
    });
  });
});
