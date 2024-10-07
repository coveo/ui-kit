import {
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../../../features/commerce/facets/category-facet/category-facet-actions.js';
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
    moreValuesAvailable = false
  ) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({
        facetId,
        type: 'hierarchical',
        ...config,
      }),
    });
    mockFacetResponseSelector.mockReturnValue(
      buildMockCategoryFacetResponse({
        moreValuesAvailable,
        facetId,
        type: 'hierarchical',
        values: config.values ?? [],
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

  it('#showLessValues dispatches #updateCategoryFacetNumberOfValues with correct payload', () => {
    facet.showLessValues();

    expect(updateCategoryFacetNumberOfValues).toHaveBeenCalledWith({
      facetId,
      numberOfValues: 5,
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
      describe('when no value is selected', () => {
        it('when there are no values, returns false', () => {
          expect(facet.state.canShowLessValues).toBe(false);
        });
        it('when there are fewer values than default number of values, returns false', () => {
          setFacetState({
            values: [buildMockCategoryFacetValue()],
          });

          expect(facet.state.canShowLessValues).toBe(false);
        });
        it('when there are more values than default number of values, returns true', () => {
          setFacetState({
            values: [
              buildMockCategoryFacetValue(),
              buildMockCategoryFacetValue(),
              buildMockCategoryFacetValue(),
              buildMockCategoryFacetValue(),
              buildMockCategoryFacetValue(),
              buildMockCategoryFacetValue(),
            ],
          });

          expect(facet.state.canShowLessValues).toBe(false);
        });
      });

      describe('when a value is selected', () => {
        it('when selected value has no children, returns false', () => {
          setFacetState({
            values: [
              buildMockCategoryFacetValue({
                state: 'selected',
              }),
            ],
          });

          expect(facet.state.canShowLessValues).toBe(false);
        });
        it('when selected value fewer children than default number of values, returns false', () => {
          setFacetState({
            values: [
              buildMockCategoryFacetValue({
                state: 'selected',
                children: [buildMockCategoryFacetValue()],
              }),
            ],
          });

          expect(facet.state.canShowLessValues).toBe(false);
        });
        it('when selected value has more children than default number of values, return true', () => {
          setFacetState({
            values: [
              buildMockCategoryFacetValue({
                state: 'selected',
                children: [
                  buildMockCategoryFacetValue(),
                  buildMockCategoryFacetValue(),
                  buildMockCategoryFacetValue(),
                  buildMockCategoryFacetValue(),
                  buildMockCategoryFacetValue(),
                  buildMockCategoryFacetValue(),
                ],
              }),
            ],
          });

          expect(facet.state.canShowLessValues).toBe(true);
        });
      });
    });

    describe('#canShowMoreValues', () => {
      describe('when no value is selected', () => {
        it('when there are no more values available, returns false', () => {
          expect(facet.state.canShowMoreValues).toBe(false);
        });

        it('when there are more values available, returns true', () => {
          setFacetState({}, true);

          expect(facet.state.canShowMoreValues).toBe(true);
        });
      });

      describe('when a value is selected', () => {
        it('when selected values has no more values available, returns false', () => {
          setFacetState({
            values: [buildMockCategoryFacetValue({state: 'selected'})],
          });

          expect(facet.state.canShowMoreValues).toBe(false);
        });
        it('when selected value has more values available, returns true', () => {
          setFacetState({
            values: [
              buildMockCategoryFacetValue({
                state: 'selected',
                moreValuesAvailable: true,
              }),
            ],
          });

          expect(facet.state.canShowMoreValues).toBe(true);
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
      it('when no value is selected, returns false', () => {
        expect(facet.state.hasActiveValues).toBe(false);
      });

      it('when a value is selected, returns true', () => {
        setFacetState({
          values: [buildMockCategoryFacetValue({state: 'selected'})],
        });

        expect(facet.state.hasActiveValues).toBe(true);
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
