import {
  CommerceCategoryFacetValueRequest,
  CommerceFacetRequest,
} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {CommerceCategoryFacetValue} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../../../features/facets/category-facet-set/category-facet-set-actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceCategoryFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceCategoryFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {commonOptions} from '../../../product-listing/facets/headless-product-listing-facet-options';
import {
  CommerceCategoryFacet,
  CommerceCategoryFacetOptions,
  buildCommerceCategoryFacet,
} from './headless-commerce-category-facet';

jest.mock(
  '../../../../../features/facets/category-facet-set/category-facet-set-actions'
);

describe('CommerceCategoryFacet', () => {
  const facetId: string = 'category_facet_id';
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: CommerceCategoryFacetOptions;
  let facet: CommerceCategoryFacet;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initCategoryFacet() {
    facet = buildCommerceCategoryFacet(engine, options);
  }

  function setFacetRequestAndResponse(
    config: Partial<
      CommerceFacetRequest<CommerceCategoryFacetValueRequest>
    > = {},
    moreValuesAvailable = false
  ) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({
        facetId,
        type: 'hierarchical',
        ...config,
      }),
    });
    state.productListing.facets = [
      buildMockCommerceCategoryFacetResponse({
        moreValuesAvailable,
        facetId,
        type: 'hierarchical',
        values: (config.values as CommerceCategoryFacetValue[]) ?? [],
      }),
    ];
  }

  // TODO: function setFacetSearch() { state.facetSearchSet[facetId] = buildMockFacetSearch(); }

  beforeEach(() => {
    jest.resetAllMocks();

    options = {
      facetId,
      ...commonOptions,
    };

    state = buildMockCommerceState();
    setFacetRequestAndResponse();
    // TODO: setFacetSearch();

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
    const facetValue = buildMockCommerceCategoryFacetValue();
    facet.toggleSelect(facetValue);

    expect(toggleSelectCategoryFacetValue).toHaveBeenCalledWith({
      facetId,
      selection: facetValue,
    });
  });

  it('#showLessValues dispatches #updateCategoryFacetNumberOfValues with correct payload', () => {
    facet.showLessValues();

    expect(updateCategoryFacetNumberOfValues).toHaveBeenCalledWith({
      facetId,
      numberOfValues: 1,
    });
  });

  it('#showMoreValues dispatches #updateCategoryFacetNumberOfValues with correct payload', () => {
    facet.showMoreValues();

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
        const activeValue = buildMockCommerceCategoryFacetValue({
          state: 'selected',
        });
        setFacetRequestAndResponse({
          values: [activeValue, buildMockCommerceCategoryFacetValue()],
        });

        expect(facet.state.activeValue).toBe(activeValue);
      });
    });

    describe('#canShowLessValues', () => {
      describe('when no value is selected', () => {
        it('when there are no values, returns false', () => {
          expect(facet.state.canShowLessValues).toBe(false);
        });
        it('when there is one value, returns false', () => {
          setFacetRequestAndResponse({
            values: [buildMockCommerceCategoryFacetValue()],
          });

          expect(facet.state.canShowLessValues).toBe(false);
        });
        it('when there are multiple values, returns true', () => {
          setFacetRequestAndResponse({
            values: [
              buildMockCommerceCategoryFacetValue(),
              buildMockCommerceCategoryFacetValue(),
            ],
          });

          expect(facet.state.canShowLessValues).toBe(true);
        });
      });

      describe('when a value is selected', () => {
        it('when selected value has no children, returns false', () => {
          setFacetRequestAndResponse({
            values: [
              buildMockCommerceCategoryFacetValue({
                state: 'selected',
              }),
            ],
          });

          expect(facet.state.canShowLessValues).toBe(false);
        });
        it('when selected value has one child, returns false', () => {
          setFacetRequestAndResponse({
            values: [
              buildMockCommerceCategoryFacetValue({
                state: 'selected',
                children: [buildMockCommerceCategoryFacetValue()],
              }),
            ],
          });

          expect(facet.state.canShowLessValues).toBe(false);
        });
        it('when selected value has multiple children, return true', () => {
          setFacetRequestAndResponse({
            values: [
              buildMockCommerceCategoryFacetValue({
                state: 'selected',
                children: [
                  buildMockCommerceCategoryFacetValue(),
                  buildMockCommerceCategoryFacetValue(),
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
          setFacetRequestAndResponse({}, true);

          expect(facet.state.canShowMoreValues).toBe(true);
        });
      });

      describe('when a value is selected', () => {
        it('when selected values has no more values available, returns false', () => {
          setFacetRequestAndResponse({
            values: [buildMockCommerceCategoryFacetValue({state: 'selected'})],
          });

          expect(facet.state.canShowMoreValues).toBe(false);
        });
        it('when selected value has more values available, returns true', () => {
          setFacetRequestAndResponse({
            values: [
              buildMockCommerceCategoryFacetValue({
                state: 'selected',
                moreValuesAvailable: true,
              }),
            ],
          });

          expect(facet.state.canShowMoreValues).toBe(true);
        });
      });
    });

    describe('#hasActiveValues', () => {
      it('when no value is selected, returns false', () => {
        expect(facet.state.hasActiveValues).toBe(false);
      });

      it('when a value is selected, returns true', () => {
        setFacetRequestAndResponse({
          values: [buildMockCommerceCategoryFacetValue({state: 'selected'})],
        });

        expect(facet.state.hasActiveValues).toBe(true);
      });
    });

    describe('#selectedValueAncestry', () => {
      it('when no value is selected, returns empty array', () => {
        expect(facet.state.selectedValueAncestry).toEqual([]);
      });

      it('when a value is selected, returns the selected value ancestry', () => {
        const activeValue = buildMockCommerceCategoryFacetValue({
          value: 'c',
          path: ['a', 'b', 'c'],
          state: 'selected',
          children: [
            buildMockCommerceCategoryFacetValue({
              value: 'd',
              path: ['a', 'b', 'c', 'd'],
            }),
            buildMockCommerceCategoryFacetValue({
              value: 'e',
              path: ['a', 'b', 'c', 'e'],
            }),
          ],
        });
        const parentValue = buildMockCommerceCategoryFacetValue({
          value: 'b',
          path: ['a', 'b'],
          children: [activeValue],
        });

        const rootValue = buildMockCommerceCategoryFacetValue({
          value: 'a',
          path: ['a'],
          children: [parentValue],
        });

        setFacetRequestAndResponse({
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
});
