import {commerceFacetSetReducer as commerceFacetSet} from '../../../../../features/commerce/facets/facet-set/facet-set-slice';
import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/common';
import {facetOrderReducer as facetOrder} from '../../../../../features/facets/facet-order/facet-order-slice';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {buildMockCategoryFacetSearch} from '../../../../../test/mock-category-facet-search';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search';
import {buildProductListingCategoryFacet} from '../../../product-listing/facets/headless-product-listing-category-facet';
import {buildProductListingDateFacet} from '../../../product-listing/facets/headless-product-listing-date-facet';
import {buildProductListingNumericFacet} from '../../../product-listing/facets/headless-product-listing-numeric-facet';
import {buildProductListingRegularFacet} from '../../../product-listing/facets/headless-product-listing-regular-facet';
import {
  buildFacetGenerator,
  FacetGenerator,
  FacetGeneratorOptions,
} from './headless-commerce-facet-generator';

describe('FacetGenerator', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: FacetGeneratorOptions;
  let facetGenerator: FacetGenerator;

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
    jest.resetAllMocks();

    options = {
      buildNumericFacet: buildProductListingNumericFacet,
      buildRegularFacet: buildProductListingRegularFacet,
      buildDateFacet: buildProductListingDateFacet,
      buildCategoryFacet: buildProductListingCategoryFacet,
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
      expect(facetGenerator.facets[0].state).toEqual(
        buildProductListingRegularFacet(engine, {facetId}).state
      );
    });

    it('when engine facet state contains a numeric facet, generates a numeric facet controller', () => {
      const facetId = 'numeric_facet_id';
      setFacetState([{facetId, type: 'numericalRange'}]);

      expect(facetGenerator.facets.length).toEqual(1);
      expect(facetGenerator.facets[0].state).toEqual(
        buildProductListingNumericFacet(engine, {facetId}).state
      );
    });

    it('when engine facet state contains a date facet, generates a date facet controller', () => {
      const facetId = 'date_facet_id';
      setFacetState([{facetId, type: 'dateRange'}]);

      expect(facetGenerator.facets.length).toEqual(1);
      expect(facetGenerator.facets[0].state).toEqual(
        buildProductListingDateFacet(engine, {facetId}).state
      );
    });

    it('when engine facet state contains a category facet, generates a category facet controller', () => {
      const facetId = 'category_facet_id';
      setFacetState([{facetId, type: 'hierarchical'}]);

      expect(facetGenerator.facets.length).toEqual(1);
      expect(facetGenerator.facets[0].state).toEqual(
        buildProductListingCategoryFacet(engine, {facetId}).state
      );
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

      expect(facetGenerator.facets.length).toEqual(4);
      expect(facetGenerator.facets[0].state).toEqual(
        buildProductListingRegularFacet(engine, {facetId: facets[0].facetId})
          .state
      );
      expect(facetGenerator.facets[1].state).toEqual(
        buildProductListingNumericFacet(engine, {facetId: facets[1].facetId})
          .state
      );
      expect(facetGenerator.facets[2].state).toEqual(
        buildProductListingDateFacet(engine, {facetId: facets[2].facetId}).state
      );
      expect(facetGenerator.facets[3].state).toEqual(
        buildProductListingCategoryFacet(engine, {facetId: facets[3].facetId})
          .state
      );
    });
  });

  it('#state exposes the facet order', () => {
    expect(facetGenerator.state).toEqual(state.facetOrder);

    state.facetOrder.push('new_facet_id');

    initCommerceFacetGenerator();

    expect(facetGenerator.state).toEqual(state.facetOrder);
  });
});
