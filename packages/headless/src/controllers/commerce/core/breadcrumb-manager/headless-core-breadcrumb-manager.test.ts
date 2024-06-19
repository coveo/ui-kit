import {Action} from '@reduxjs/toolkit';
import {stateKey} from '../../../../app/state-key';
import {deselectAllBreadcrumbs} from '../../../../features/breadcrumb/breadcrumb-actions';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../../../features/commerce/facets/date-facet/date-facet-actions';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {
  AnyFacetResponse,
  AnyFacetValueResponse,
  CategoryFacetValue,
  DateFacetValue,
  NumericFacetValue,
  RegularFacetValue,
} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../../features/commerce/facets/numeric-facet/numeric-facet-actions';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../features/commerce/facets/regular-facet/regular-facet-actions';
import {FacetValueState} from '../../../../features/facets/facet-api/value';
import {facetOrderReducer as facetOrder} from '../../../../features/facets/facet-order/facet-order-slice';
import {
  deselectAllFacetValues,
  updateFreezeCurrentValues,
} from '../../../../features/facets/facet-set/facet-set-actions';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {
  buildMockCategoryFacetResponse,
  buildMockCommerceDateFacetResponse,
  buildMockCommerceNumericFacetResponse,
  buildMockCommerceRegularFacetResponse,
} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
  CoreBreadcrumbManagerOptions,
} from './headless-core-breadcrumb-manager';

jest.mock('../../../../features/facets/facet-set/facet-set-actions');
jest.mock(
  '../../../../features/commerce/facets/numeric-facet/numeric-facet-actions'
);
jest.mock('../../../../features/commerce/facets/date-facet/date-facet-actions');
jest.mock('../../../../features/breadcrumb/breadcrumb-actions');

jest.mock(
  '../../../../features/commerce/facets/regular-facet/regular-facet-actions'
);

describe('core breadcrumb manager', () => {
  let engine: MockedCommerceEngine;
  let options: CoreBreadcrumbManagerOptions;
  let breadcrumbManager: BreadcrumbManager;

  const facetId = 'some_facet_id';
  const facetResponseSelector = jest.fn();
  const fetchProductsActionCreator = jest.fn();

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initBreadcrumbManager() {
    breadcrumbManager = buildCoreBreadcrumbManager(engine, options);
  }

  function setFacetsState({facetId, ...restOfResponse}: AnyFacetResponse) {
    engine[stateKey].facetOrder.push(facetId);
    engine[stateKey].commerceFacetSet[facetId] = {
      request: buildMockCommerceFacetRequest(),
    };
    facetResponseSelector.mockReturnValue({facetId, ...restOfResponse});
  }

  beforeEach(() => {
    jest.resetAllMocks();

    options = {
      facetResponseSelector,
      fetchProductsActionCreator,
    };

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

  describe('#deselectAll', () => {
    it('deselects all breadcrumbs', () => {
      breadcrumbManager.deselectAll();
      expect(deselectAllBreadcrumbs).toHaveBeenCalled();
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
      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
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
        expect(updateFreezeCurrentValues).toHaveBeenCalledWith({
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
