import {
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../../../features/commerce/facets/category-facet/category-facet-actions.js';
import {AnyFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request.js';
import {CategoryFacetResponse} from '../../../../../features/commerce/facets/facet-set/interfaces/response.js';
import {CommerceAppState} from '../../../../../state/commerce-app-state.js';
import {buildMockCategoryFacetSearch} from '../../../../../test/mock-category-facet-search.js';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request.js';
import {buildMockCategoryFacetResponse} from '../../../../../test/mock-commerce-facet-response.js';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice.js';
import {buildMockCategoryFacetValue} from '../../../../../test/mock-commerce-facet-value.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2.js';
import {
  CategoryFacet,
  CategoryFacetOptions,
  buildCategoryFacet,
} from './headless-commerce-category-facet.js';

vi.mock(
  '../../../../../features/commerce/facets/category-facet/category-facet-actions'
);

describe('CategoryFacet', () => {
  const facetId: string = 'category_facet_id';
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: CategoryFacetOptions;
  let facet: CategoryFacet;
  const mockFetchProductsActionCreator = vi.fn();
  const mockFacetResponseSelector = vi.fn();
  const mockIsFacetLoadingResponseSelector = vi.fn();

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initCategoryFacet() {
    facet = buildCategoryFacet(engine, options);
  }

  function setFacetState(
    config: Partial<CategoryFacetResponse> = {},
    moreValuesAvailable = false,
    requestConfig: Partial<AnyFacetRequest> = {}
  ) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({
        facetId,
        type: 'hierarchical',
        ...requestConfig,
      }),
    });
    mockFacetResponseSelector.mockReturnValue(
      buildMockCategoryFacetResponse({
        moreValuesAvailable,
        facetId,
        type: 'hierarchical',
        values: config.values ?? [],
        ...config,
      })
    );
    state.categoryFacetSearchSet[facetId] = buildMockCategoryFacetSearch();
  }

  beforeEach(() => {
    vi.resetAllMocks();

    options = {
      facetId,
      fetchProductsActionCreator: mockFetchProductsActionCreator,
      facetResponseSelector: mockFacetResponseSelector,
      isFacetLoadingResponseSelector: mockIsFacetLoadingResponseSelector,
      facetSearch: {type: 'SEARCH'},
    };

    state = buildMockCommerceState();
    setFacetState();

    initEngine(state);
    initCategoryFacet();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(facet).toBeTruthy();
    });

    it('exposes #subscribe method', () => {
      expect(facet.subscribe).toBeTruthy();
    });
  });

  it('#toggleSelect dispatches #toggleSelectCategoryFacetValue with correct payload', () => {
    const facetValue = buildMockCategoryFacetValue();
    facet.toggleSelect(facetValue);

    expect(toggleSelectCategoryFacetValue).toHaveBeenCalledWith({
      facetId,
      selection: facetValue,
    });
  });

  it('#showMoreValues dispatches #updateCategoryFacetNumberOfValues with correct payload', () => {
    facet.showMoreValues();

    expect(updateCategoryFacetNumberOfValues).toHaveBeenCalledWith({
      facetId,
      numberOfValues: 5,
    });
  });

  describe('#showLessValues', () => {
    it('should dispatch #updateCategoryFacetNumberOfValues with initialNumberOfValues from the request', () => {
      setFacetState({}, false, {initialNumberOfValues: 7});

      facet.showLessValues();

      expect(updateCategoryFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: 7,
      });
    });

    it('should dispatch #updateCategoryFacetNumberOfValues with 1 when initialNumberOfValues is not set', () => {
      setFacetState({}, false, {initialNumberOfValues: undefined});

      facet.showLessValues();

      expect(updateCategoryFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: 1,
      });
    });

    it('should dispatch #fetchProductsActionCreator after updating number of values', () => {
      setFacetState({}, false, {initialNumberOfValues: 3});

      facet.showLessValues();

      expect(updateCategoryFacetNumberOfValues).toHaveBeenCalled();
      expect(mockFetchProductsActionCreator).toHaveBeenCalled();

      const updateCall = (
        updateCategoryFacetNumberOfValues as unknown as {
          mock: {invocationCallOrder: number[]};
        }
      ).mock.invocationCallOrder[0];
      const fetchCall =
        mockFetchProductsActionCreator.mock.invocationCallOrder[0];

      expect(updateCall).toBeLessThan(fetchCall);
    });
  });

  describe('#state', () => {
    describe('#activeValue', () => {
      it('when no value is selected, returns undefined', () => {
        expect(facet.state.activeValue).toBeUndefined();
      });
      it('when a value is selected, returns the selected value', () => {
        const activeValue = buildMockCategoryFacetValue({
          state: 'selected',
        });
        setFacetState({
          values: [activeValue, buildMockCategoryFacetValue()],
        });

        expect(facet.state.activeValue).toEqual(activeValue);
      });
    });

    describe('#canShowLessValues', () => {
      it('should be false when initialNumberOfValues is not defined in the request', () => {
        setFacetState({}, false, {
          initialNumberOfValues: undefined,
        });

        expect(facet.state.canShowLessValues).toBe(false);
      });

      describe('when initialNumberOfValues is defined in the request', () => {
        describe('when a value is active in the facet', () => {
          it('should be true when initialNumberOfValues is smaller than the number of children in the active value', () => {
            const activeValue = buildMockCategoryFacetValue({
              state: 'selected',
              children: [
                buildMockCategoryFacetValue(),
                buildMockCategoryFacetValue(),
                buildMockCategoryFacetValue(),
              ],
            });
            setFacetState(
              {
                values: [activeValue],
              },
              false,
              {
                initialNumberOfValues: 2,
              }
            );

            expect(facet.state.canShowLessValues).toBe(true);
          });

          it('should be false when initialNumberOfValues is greater than the number of children in the active value', () => {
            const activeValue = buildMockCategoryFacetValue({
              state: 'selected',
              children: [
                buildMockCategoryFacetValue(),
                buildMockCategoryFacetValue(),
              ],
            });
            setFacetState(
              {
                values: [activeValue],
              },
              false,
              {
                initialNumberOfValues: 5,
              }
            );

            expect(facet.state.canShowLessValues).toBe(false);
          });

          it('should be false when initialNumberOfValues is equal to the number of children in the active value', () => {
            const activeValue = buildMockCategoryFacetValue({
              state: 'selected',
              children: [
                buildMockCategoryFacetValue(),
                buildMockCategoryFacetValue(),
                buildMockCategoryFacetValue(),
              ],
            });
            setFacetState(
              {
                values: [activeValue],
              },
              false,
              {
                initialNumberOfValues: 3,
              }
            );

            expect(facet.state.canShowLessValues).toBe(false);
          });
        });

        describe('when no value is active in the facet', () => {
          describe('when numberOfValues is defined in the request', () => {
            it('should be true when initialNumberOfValues is smaller than numberOfValues', () => {
              setFacetState({}, false, {
                initialNumberOfValues: 3,
                numberOfValues: 5,
              });

              expect(facet.state.canShowLessValues).toBe(true);
            });

            it('should be false when initialNumberOfValues is greater than numberOfValues', () => {
              setFacetState({}, false, {
                initialNumberOfValues: 7,
                numberOfValues: 5,
              });

              expect(facet.state.canShowLessValues).toBe(false);
            });
            it('should be false when the initial number of values is equal to numberOfValues', () => {
              setFacetState({}, false, {
                initialNumberOfValues: 5,
                numberOfValues: 5,
              });

              expect(facet.state.canShowLessValues).toBe(false);
            });
          });

          describe('when numberOfValues is not defined in the request', () => {
            it('should be true when initialNumberOfValues is smaller than the number of values in the response', () => {
              setFacetState(
                {
                  values: [
                    buildMockCategoryFacetValue(),
                    buildMockCategoryFacetValue(),
                    buildMockCategoryFacetValue(),
                  ],
                },
                false,
                {
                  initialNumberOfValues: 2,
                  numberOfValues: undefined,
                }
              );

              expect(facet.state.canShowLessValues).toBe(true);
            });

            it('should be false when initialNumberOfValues is greater than the number of values in the response', () => {
              setFacetState(
                {
                  values: [
                    buildMockCategoryFacetValue(),
                    buildMockCategoryFacetValue(),
                  ],
                },
                false,
                {
                  initialNumberOfValues: 5,
                  numberOfValues: undefined,
                }
              );

              expect(facet.state.canShowLessValues).toBe(false);
            });

            it('should be false when initialNumberOfValues is equal to the number of values in the response', () => {
              setFacetState(
                {
                  values: [
                    buildMockCategoryFacetValue(),
                    buildMockCategoryFacetValue(),
                    buildMockCategoryFacetValue(),
                  ],
                },
                false,
                {
                  initialNumberOfValues: 3,
                  numberOfValues: undefined,
                }
              );

              expect(facet.state.canShowLessValues).toBe(false);
            });
          });
        });
      });
    });

    describe('#canShowMoreValues', () => {
      describe('when a value is active in the facet', () => {
        it('should be true when canShowMoreValues is true on the active value', () => {
          const activeValue = buildMockCategoryFacetValue({
            state: 'selected',
            moreValuesAvailable: true,
          });
          setFacetState({values: [activeValue]});
          expect(facet.state.canShowMoreValues).toBe(true);
        });

        it('should be false when canShowMoreValues is false on the active value', () => {
          const activeValue = buildMockCategoryFacetValue({
            state: 'selected',
            moreValuesAvailable: false,
          });
          setFacetState({values: [activeValue]});
          expect(facet.state.canShowMoreValues).toBe(false);
        });
      });
      describe('when no value is active in the facet', () => {
        it('should be true when canShowMoreValues is true in the core facet state', () => {
          setFacetState({}, true);
          expect(facet.state.canShowMoreValues).toBe(true);
        });

        it('should be false when canShowMoreValues is false in the core facet state', () => {
          setFacetState({}, false);
          expect(facet.state.canShowMoreValues).toBe(false);
        });
      });
    });

    it('#facetSearch returns the facet search state', () => {
      const facetSearchState = buildMockCategoryFacetSearch();
      facetSearchState.isLoading = true;
      facetSearchState.response.moreValuesAvailable = true;
      facetSearchState.options.query = 'test';
      facetSearchState.response.values = [
        {count: 1, displayValue: 'test', path: ['test'], rawValue: 'test'},
      ];

      state.categoryFacetSearchSet[facetId] = facetSearchState;

      expect(facet.state.facetSearch).toEqual({
        isLoading: true,
        moreValuesAvailable: true,
        query: 'test',
        values: [
          {count: 1, displayValue: 'test', path: ['test'], rawValue: 'test'},
        ],
      });
    });

    describe('#hasActiveValues', () => {
      it('should be true when a value is active in the facet', () => {
        setFacetState({
          values: [buildMockCategoryFacetValue({state: 'selected'})],
        });

        expect(facet.state.hasActiveValues).toBe(true);
      });

      it('should be false when no value is active in the facet', () => {
        expect(facet.state.hasActiveValues).toBe(false);
      });
    });

    describe('#selectedValueAncestry', () => {
      it('when no value is selected, returns empty array', () => {
        expect(facet.state.selectedValueAncestry).toEqual([]);
      });

      it('when a value is selected, returns the selected value ancestry', () => {
        const activeValue = buildMockCategoryFacetValue({
          value: 'c',
          path: ['a', 'b', 'c'],
          state: 'selected',
          children: [
            buildMockCategoryFacetValue({
              value: 'd',
              path: ['a', 'b', 'c', 'd'],
            }),
            buildMockCategoryFacetValue({
              value: 'e',
              path: ['a', 'b', 'c', 'e'],
            }),
          ],
        });
        const parentValue = buildMockCategoryFacetValue({
          value: 'b',
          path: ['a', 'b'],
          children: [activeValue],
        });

        const rootValue = buildMockCategoryFacetValue({
          value: 'a',
          path: ['a'],
          children: [parentValue],
        });

        setFacetState({
          values: [rootValue],
        });

        expect(facet.state.selectedValueAncestry).toEqual([
          rootValue,
          parentValue,
          activeValue,
        ]);
      });
    });
  });

  it('#type returns "hierarchical"', () => {
    expect(facet.type).toBe('hierarchical');
  });
});
