import type {Action} from '@reduxjs/toolkit';
import {
  clearAllCoreFacets,
  deselectAllValuesInCoreFacet,
  updateCoreFacetFreezeCurrentValues,
} from '../../../../features/commerce/facets/core-facet/core-facet-actions.js';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../../../features/commerce/facets/date-facet/date-facet-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice.js';
import type {
  AnyFacetResponse,
  AnyFacetValueResponse,
  CategoryFacetValue,
  DateFacetValue,
  LocationFacetValue,
  NumericFacetValue,
  RegularFacetValue,
} from '../../../../features/commerce/facets/facet-set/interfaces/response.js';
import {toggleSelectLocationFacetValue} from '../../../../features/commerce/facets/location-facet/location-facet-actions.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../../features/commerce/facets/numeric-facet/numeric-facet-actions.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../features/commerce/facets/regular-facet/regular-facet-actions.js';
import type {FacetValueState} from '../../../../features/facets/facet-api/value.js';
import {facetOrderReducer as facetOrder} from '../../../../features/facets/facet-order/facet-order-slice.js';
import type {CommerceAppState} from '../../../../state/commerce-app-state.js';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request.js';
import {
  buildMockCategoryFacetResponse,
  buildMockCommerceDateFacetResponse,
  buildMockCommerceLocationFacetResponse,
  buildMockCommerceNumericFacetResponse,
  buildMockCommerceRegularFacetResponse,
} from '../../../../test/mock-commerce-facet-response.js';
import {
  buildMockCategoryFacetValue,
  buildMockCommerceRegularFacetValue,
} from '../../../../test/mock-commerce-facet-value.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {
  type BreadcrumbManager,
  buildCoreBreadcrumbManager,
  type CoreBreadcrumbManagerOptions,
} from './headless-core-breadcrumb-manager.js';

vi.mock('../../../../features/commerce/facets/core-facet/core-facet-actions');
vi.mock(
  '../../../../features/commerce/facets/numeric-facet/numeric-facet-actions'
);
vi.mock('../../../../features/commerce/facets/date-facet/date-facet-actions');
vi.mock(
  '../../../../features/commerce/facets/regular-facet/regular-facet-actions'
);
vi.mock(
  '../../../../features/commerce/facets/location-facet/location-facet-actions'
);

describe('core breadcrumb manager', () => {
  let engine: MockedCommerceEngine;
  let options: CoreBreadcrumbManagerOptions;
  let breadcrumbManager: BreadcrumbManager;
  let state: CommerceAppState;

  const facetId = 'some_facet_id';
  const facetResponseSelector = vi.fn();
  const fetchProductsActionCreator = vi.fn();

  function initEngine() {
    engine = buildMockCommerceEngine(state);
  }

  function initBreadcrumbManager() {
    breadcrumbManager = buildCoreBreadcrumbManager(engine, options);
  }

  function setFacetsState({facetId, ...restOfResponse}: AnyFacetResponse) {
    state.facetOrder.push(facetId);
    state.commerceFacetSet[facetId] = {
      request: buildMockCommerceFacetRequest(),
    };
    facetResponseSelector.mockReturnValue({facetId, ...restOfResponse});
  }

  beforeEach(() => {
    vi.resetAllMocks();
    options = {
      facetResponseSelector,
      fetchProductsActionCreator,
    };
    state = buildMockCommerceState();
    initEngine();
    initBreadcrumbManager();
  });

  it('initializes', () => {
    expect(breadcrumbManager).toBeTruthy();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      facetOrder,
      commerceFacetSet,
    });
  });

  it('exposes #subscribe method', () => {
    expect(breadcrumbManager.subscribe).toBeTruthy();
  });

  describe('#hasBreadcrumbs', () => {
    it('#hasBreadcrumbs is false when there are no facets', () => {
      expect(breadcrumbManager.state.hasBreadcrumbs).toEqual(false);
    });

    it('#hasBreadcrumbs is false when there are no facet values', () => {
      setFacetsState(
        buildMockCommerceRegularFacetResponse({facetId, values: []})
      );
      expect(breadcrumbManager.state.hasBreadcrumbs).toEqual(false);
    });

    it('#hasBreadcrumbs is false when all values in a non-category facet are idle', () => {
      setFacetsState(
        buildMockCommerceRegularFacetResponse({
          facetId,
          values: [buildMockCommerceRegularFacetValue({state: 'idle'})],
        })
      );

      expect(breadcrumbManager.state.hasBreadcrumbs).toEqual(false);
    });

    it('#hasBreadcrumb is false when all values in a category facet are idle', () => {
      setFacetsState(
        buildMockCategoryFacetResponse({
          facetId: 'category_facet',
          values: [buildMockCategoryFacetValue({state: 'idle'})],
        })
      );

      expect(breadcrumbManager.state.hasBreadcrumbs).toEqual(false);
    });

    it('#hasBreadcrumbs is true when there is a selected value in a non-category facet', () => {
      setFacetsState(
        buildMockCommerceRegularFacetResponse({
          facetId,
          values: [buildMockCommerceRegularFacetValue({state: 'selected'})],
        })
      );

      expect(breadcrumbManager.state.hasBreadcrumbs).toEqual(true);
    });

    it('#hasBreadcrumbs is true when the top parent value is selected in a category facet', () => {
      setFacetsState(
        buildMockCategoryFacetResponse({
          facetId: 'category_facet',
          values: [buildMockCategoryFacetValue({state: 'selected'})],
        })
      );

      expect(breadcrumbManager.state.hasBreadcrumbs).toEqual(true);
    });

    it('#hasBreadcrumbs is true when a child value is selected in a category facet', () => {
      setFacetsState(
        buildMockCategoryFacetResponse({
          facetId: 'category_facet',
          values: [
            buildMockCategoryFacetValue({
              state: 'idle',
              children: [
                buildMockCategoryFacetValue({
                  state: 'selected',
                }),
              ],
            }),
          ],
        })
      );

      expect(breadcrumbManager.state.hasBreadcrumbs).toEqual(true);
    });

    it('#hasBreadcrumbs is true when there is an excluded facet value', () => {
      setFacetsState(
        buildMockCommerceRegularFacetResponse({
          facetId,
          values: [buildMockCommerceRegularFacetValue({state: 'excluded'})],
        })
      );

      expect(breadcrumbManager.state.hasBreadcrumbs).toEqual(true);
    });
  });

  describe('#deselectAll', () => {
    it('deselects all breadcrumbs', () => {
      breadcrumbManager.deselectAll();
      expect(clearAllCoreFacets).toHaveBeenCalled();
    });

    it('dispatches #fetchProductsActionCreator', () => {
      breadcrumbManager.deselectAll();
      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  describe('regular facet breadcrumbs', () => {
    const breadcrumb = {
      value: 'Corp Corp',
      state: 'selected',
    } as RegularFacetValue;

    beforeEach(() => {
      setFacetsState(
        buildMockCommerceRegularFacetResponse({
          facetId,
          values: [
            {value: 'Acme', state: 'idle'},
            breadcrumb,
          ] as RegularFacetValue[],
        })
      );
    });

    it('generates breadcrumbs', () => {
      expectBreadcrumbToBePresentInState(breadcrumb);
    });

    describe.each([
      ['selected', toggleSelectFacetValue],
      ['excluded', toggleExcludeFacetValue],
    ])('#deselect when facet is %s', generateDeselectionTestCases(breadcrumb));
  });

  describe('location facet breadcrumbs', () => {
    const breadcrumb = {
      value: 'Corp Corp Quarters',
      state: 'selected',
    } as LocationFacetValue;

    beforeEach(() => {
      setFacetsState(
        buildMockCommerceLocationFacetResponse({
          facetId,
          values: [
            {value: 'Acme', state: 'idle'},
            breadcrumb,
          ] as LocationFacetValue[],
        })
      );
    });

    it('generates breadcrumbs', () => {
      expectBreadcrumbToBePresentInState(breadcrumb);
    });

    describe('#deselect when facet is selected', () => {
      beforeEach(() => {
        breadcrumb.state = 'selected';
        deselectBreadcrumb();
      });

      it('dispatches #toggleSelectActionCreator', () => {
        expect(toggleSelectLocationFacetValue).toHaveBeenCalledWith({
          facetId,
          selection: breadcrumb,
        });
      });

      it('dispatches #fetchProductsActionCreator', () => {
        expect(fetchProductsActionCreator).toHaveBeenCalled();
      });
    });
  });

  describe('numeric facet breadcrumbs', () => {
    const breadcrumb = {
      start: 100,
      end: 200,
      state: 'selected',
    } as NumericFacetValue;

    beforeEach(() => {
      setFacetsState(
        buildMockCommerceNumericFacetResponse({
          facetId,
          values: [
            {start: 0, end: 100, state: 'idle'},
            breadcrumb,
          ] as NumericFacetValue[],
        })
      );
    });

    it('generates breadcrumbs', () => {
      expectBreadcrumbToBePresentInState(breadcrumb);
    });

    describe.each([
      ['selected', toggleSelectNumericFacetValue],
      ['excluded', toggleExcludeNumericFacetValue],
    ])('#deselect when facet is %s', generateDeselectionTestCases(breadcrumb));
  });

  describe('date facet breadcrumbs', () => {
    const breadcrumb = {
      start: '2020',
      end: '2021',
      state: 'selected',
    } as DateFacetValue;

    beforeEach(() => {
      setFacetsState(
        buildMockCommerceDateFacetResponse({
          facetId,
          values: [
            {start: '2019', end: '2020', state: 'idle'},
            breadcrumb,
          ] as DateFacetValue[],
        })
      );
    });

    it('generates breadcrumbs', () => {
      expectBreadcrumbToBePresentInState(breadcrumb);
    });

    describe.each([
      ['selected', toggleSelectDateFacetValue],
      ['excluded', toggleExcludeDateFacetValue],
    ])('#deselect when facet is %s', generateDeselectionTestCases(breadcrumb));
  });

  describe('category facet breadcrumbs', () => {
    const breadcrumb: CategoryFacetValue = {
      value: 'Shoes',
      path: ['Shoes'],
      children: [],
      state: 'selected',
      moreValuesAvailable: false,
      isAutoSelected: false,
      isLeafValue: true,
      isSuggested: false,
      numberOfResults: 10,
    };

    beforeEach(() => {
      setFacetsState(
        buildMockCategoryFacetResponse({
          facetId,
          values: [
            {
              value: 'Hats',
              path: ['Hats'],
              children: [],
              state: 'idle',
              moreValuesAvailable: false,
              isLeafValue: true,
            },
            breadcrumb,
          ] as CategoryFacetValue[],
        })
      );
    });

    it('generates breadcrumbs', () => {
      expectBreadcrumbToBePresentInState(breadcrumb);
    });

    it('when facet is selected, #deselect dispatches #toggleSelectActionCreator and #fetchProductsActionCreator', () => {
      deselectBreadcrumb();
      expect(deselectAllValuesInCoreFacet).toHaveBeenCalledWith({facetId});
      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  function expectBreadcrumbToBePresentInState(
    breadcrumb: AnyFacetValueResponse
  ) {
    expect(breadcrumbManager.state.facetBreadcrumbs[0].values).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deselect: expect.any(Function),
          value: expect.objectContaining(breadcrumb),
        }),
      ])
    );
  }

  function generateDeselectionTestCases(breadcrumb: AnyFacetValueResponse) {
    return (state: string, action: Action) => {
      beforeEach(() => {
        breadcrumb.state = state as FacetValueState;
        deselectBreadcrumb();
      });

      it('dispatches #toggleSelectActionCreator', () => {
        expect(action).toHaveBeenCalledWith({
          facetId,
          selection: breadcrumb,
        });
      });

      it('dispatches #fetchProductsActionCreator', () => {
        expect(fetchProductsActionCreator).toHaveBeenCalled();
      });

      it('dispatches #updateFreezeCurrentValues', () => {
        expect(updateCoreFacetFreezeCurrentValues).toHaveBeenCalledWith({
          facetId,
          freezeCurrentValues: false,
        });
      });
    };
  }

  function deselectBreadcrumb() {
    breadcrumbManager.state.facetBreadcrumbs[0].values[0].deselect();
  }
});
