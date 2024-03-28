import {Action} from '@reduxjs/toolkit';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {
  AnyFacetResponse,
  AnyFacetValueResponse,
  CategoryFacetValue,
  DateFacetValue,
  NumericFacetValue,
  RegularFacetValue,
} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {toggleSelectCategoryFacetValue} from '../../../../features/facets/category-facet-set/category-facet-set-actions';
import {facetOrderReducer as facetOrder} from '../../../../features/facets/facet-order/facet-order-slice';
import {toggleSelectFacetValue} from '../../../../features/facets/facet-set/facet-set-actions';
import {toggleSelectDateFacetValue} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {toggleSelectNumericFacetValue} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {
  buildMockCommerceRegularFacetResponse,
  buildMockCommerceNumericFacetResponse,
  buildMockCommerceDateFacetResponse,
  buildMockCategoryFacetResponse,
} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {facetResponseSelector} from '../../product-listing/facets/headless-product-listing-facet-options';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
  CoreBreadcrumbManagerOptions,
} from './headless-core-breadcrumb-manager';

jest.mock('../../../../features/facets/facet-set/facet-set-actions');
jest.mock(
  '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions'
);
jest.mock(
  '../../../../features/facets/range-facets/date-facet-set/date-facet-actions'
);
jest.mock(
  '../../../../features/facets/category-facet-set/category-facet-set-actions'
);

describe('BreadcrumbManager', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: CoreBreadcrumbManagerOptions;
  let breadcrumbManager: BreadcrumbManager;

  const facetId = 'some_facet_id';

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initBreadcrumbManager() {
    breadcrumbManager = buildCoreBreadcrumbManager(engine, options);
  }

  function setFacetsState({facetId, ...restOfResponse}: AnyFacetResponse) {
    engine.state.facetOrder.push(facetId);
    engine.state.commerceFacetSet[facetId] = {
      request: buildMockCommerceFacetRequest(),
    };
    engine.state.productListing.facets.push({facetId, ...restOfResponse});
  }

  beforeEach(() => {
    jest.resetAllMocks();

    options = {
      facetResponseSelector: facetResponseSelector,
      fetchResultsActionCreator: fetchProductListing,
    };

    state = buildMockCommerceState();

    initEngine(state);
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
      expectBreadcrumb(breadcrumb);
    });

    it('#deselect deselects', () => {
      expectDeselection(toggleSelectFacetValue, breadcrumb);
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
      expectBreadcrumb(breadcrumb);
    });

    it('#deselect deselects', () => {
      expectDeselection(toggleSelectNumericFacetValue, breadcrumb);
    });
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
      expectBreadcrumb(breadcrumb);
    });

    it('#deselect deselects', () => {
      expectDeselection(toggleSelectDateFacetValue, breadcrumb);
    });
  });

  describe('category facet breadcrumbs', () => {
    const breadcrumb = {
      value: 'Shoes',
      path: ['Shoes'],
      children: [],
      state: 'selected',
    } as unknown as CategoryFacetValue;

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
              numberOfResults: 10,
              isLeafValue: true,
            },
            breadcrumb,
          ] as CategoryFacetValue[],
        })
      );
    });

    it('generates breadcrumbs', () => {
      expectBreadcrumb(breadcrumb);
    });

    it('#deselect deselects', () => {
      expectDeselection(toggleSelectCategoryFacetValue, breadcrumb);
    });
  });

  function expectBreadcrumb(breadcrumb: AnyFacetValueResponse) {
    expect(breadcrumbManager.state.facetBreadcrumbs[0].values).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deselect: expect.any(Function),
          value: expect.objectContaining(breadcrumb),
        }),
      ])
    );
  }

  function expectDeselection(
    action: Action,
    breadcrumb: AnyFacetValueResponse
  ) {
    breadcrumbManager.state.facetBreadcrumbs[0].values[0].deselect();

    expect(action).toHaveBeenCalledWith({
      facetId,
      selection: breadcrumb,
    });
  }
});
