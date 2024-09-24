import {clearAllCoreFacets} from '../../../../../features/commerce/facets/core-facet/core-facet-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../../features/commerce/facets/facet-set/facet-set-slice.js';
import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/common.js';
import {facetOrderReducer as facetOrder} from '../../../../../features/facets/facet-order/facet-order-slice.js';
import {CommerceAppState} from '../../../../../state/commerce-app-state.js';
import {buildMockCategoryFacetSearch} from '../../../../../test/mock-category-facet-search.js';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2.js';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search.js';
import {
  buildFacetGenerator,
  FacetGenerator,
  FacetGeneratorOptions,
} from './headless-commerce-facet-generator.js';

vi.mock(
  '../../../../../features/commerce/facets/core-facet/core-facet-actions'
);

describe('CSR FacetGenerator', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: FacetGeneratorOptions;
  let facetGenerator: FacetGenerator;
  const mockBuildNumericFacet = vi.fn();
  const mockBuildRegularFacet = vi.fn();
  const mockBuildDateFacet = vi.fn();
  const mockBuildCategoryFacet = vi.fn();
  const mockFetchProductsActionCreator = vi.fn();

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initCommerceFacetGenerator() {
    facetGenerator = buildFacetGenerator(engine, options);
  }

  function setFacetState(config: {facetId: string; type: FacetType}[] = []) {
    for (const facet of config) {
      state.facetOrder.push(facet.facetId);
      state.commerceFacetSet[facet.facetId] = {
        request: buildMockCommerceFacetRequest({
          facetId: facet.facetId,
          type: facet.type,
        }),
      };
      state.facetSearchSet[facet.facetId] = buildMockFacetSearch();
      state.categoryFacetSearchSet[facet.facetId] =
        buildMockCategoryFacetSearch();
    }
  }

  beforeEach(() => {
    vi.resetAllMocks();

    options = {
      buildNumericFacet: mockBuildNumericFacet,
      buildRegularFacet: mockBuildRegularFacet,
      buildDateFacet: mockBuildDateFacet,
      buildCategoryFacet: mockBuildCategoryFacet,
      fetchProductsActionCreator: mockFetchProductsActionCreator,
    };

    state = buildMockCommerceState();
    setFacetState();

    initEngine(state);
    initCommerceFacetGenerator();
  });

  it('initializes', () => {
    expect(facetGenerator).toBeTruthy();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      facetOrder,
      commerceFacetSet,
    });
  });

  it('exposes #subscribe method', () => {
    expect(facetGenerator.subscribe).toBeTruthy();
  });

  describe('#facets', () => {
    it('when engine facet state contains a regular facet, generates a regular facet controller', () => {
      const facetId = 'regular_facet_id';
      setFacetState([{facetId, type: 'regular'}]);

      expect(facetGenerator.facets.length).toEqual(1);
      expect(mockBuildRegularFacet).toHaveBeenCalledWith(engine, {facetId});
    });

    it('when engine facet state contains a numeric facet, generates a numeric facet controller', () => {
      const facetId = 'numeric_facet_id';
      setFacetState([{facetId, type: 'numericalRange'}]);

      expect(facetGenerator.facets.length).toEqual(1);
      expect(mockBuildNumericFacet).toHaveBeenCalledWith(engine, {facetId});
    });

    it('when engine facet state contains a date facet, generates a date facet controller', () => {
      const facetId = 'date_facet_id';
      setFacetState([{facetId, type: 'dateRange'}]);

      expect(facetGenerator.facets.length).toEqual(1);
      expect(mockBuildDateFacet).toHaveBeenCalledWith(engine, {facetId});
    });

    it('when engine facet state contains a category facet, generates a category facet controller', () => {
      const facetId = 'category_facet_id';
      setFacetState([{facetId, type: 'hierarchical'}]);

      expect(facetGenerator.facets.length).toEqual(1);
      expect(mockBuildCategoryFacet).toHaveBeenCalledWith(engine, {facetId});
    });

    it('when engine facet state contains multiple facets, generates the proper facet controllers', () => {
      const facets: {facetId: string; type: FacetType}[] = [
        {
          facetId: 'regular_facet_id',
          type: 'regular',
        },
        {
          facetId: 'numeric_facet_id',
          type: 'numericalRange',
        },
        {
          facetId: 'date_facet_id',
          type: 'dateRange',
        },
        {
          facetId: 'category_facet_id',
          type: 'hierarchical',
        },
      ];
      setFacetState(facets);

      mockBuildRegularFacet.mockReturnValue({
        state: {facetId: facets[0].facetId},
      });
      mockBuildNumericFacet.mockReturnValue({
        state: {facetId: facets[1].facetId},
      });
      mockBuildDateFacet.mockReturnValue({state: {facetId: facets[2].facetId}});
      mockBuildCategoryFacet.mockReturnValue({
        state: {facetId: facets[3].facetId},
      });

      const facetState = facetGenerator.facets;

      expect(facetState.length).toEqual(4);
      expect(facetState[0].state.facetId).toEqual(facets[0].facetId);
      expect(facetState[1].state.facetId).toEqual(facets[1].facetId);
      expect(facetState[2].state.facetId).toEqual(facets[2].facetId);
      expect(facetState[3].state.facetId).toEqual(facets[3].facetId);
    });
  });

  it('#state exposes the facet order', () => {
    expect(facetGenerator.state).toEqual(state.facetOrder);

    state.facetOrder.push('new_facet_id');

    initCommerceFacetGenerator();

    expect(facetGenerator.state).toEqual(state.facetOrder);
  });

  describe('#deselectAll', () => {
    it('dispatches #clearAllCoreFacets', () => {
      facetGenerator.deselectAll();
      expect(clearAllCoreFacets).toHaveBeenCalled();
    });

    it('dispatches #fetchProductsActionCreator', () => {
      facetGenerator.deselectAll();
      expect(mockFetchProductsActionCreator).toHaveBeenCalled();
    });
  });
});
