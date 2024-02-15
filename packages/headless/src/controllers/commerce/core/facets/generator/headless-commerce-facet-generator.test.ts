import {commerceFacetSetReducer as commerceFacetSet} from '../../../../../features/commerce/facets/facet-set/facet-set-slice';
import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {facetOrderReducer as facetOrder} from '../../../../../features/facets/facet-order/facet-order-slice';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search';
import {buildProductListingDateFacet} from '../../../product-listing/facets/headless-product-listing-date-facet';
import {buildProductListingNumericFacet} from '../../../product-listing/facets/headless-product-listing-numeric-facet';
import {buildProductListingRegularFacet} from '../../../product-listing/facets/headless-product-listing-regular-facet';
import {
  buildCommerceFacetGenerator,
  CommerceFacetGenerator,
  CommerceFacetGeneratorOptions,
} from './headless-commerce-facet-generator';

describe('CommerceFacetGenerator', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: CommerceFacetGeneratorOptions;
  let facetGenerator: CommerceFacetGenerator;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initCommerceFacetGenerator() {
    facetGenerator = buildCommerceFacetGenerator(engine, options);
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
    }
  }

  beforeEach(() => {
    jest.resetAllMocks();

    options = {
      buildNumericFacet: buildProductListingNumericFacet,
      buildRegularFacet: buildProductListingRegularFacet,
      buildDateFacet: buildProductListingDateFacet,
    };

    state = buildMockCommerceState();
    setFacetState();

    initEngine(state);
    initCommerceFacetGenerator();
  });

  describe('initialization', () => {
    describe('regardless of the current facet state', () => {
      beforeEach(() => {
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
    });

    describe('when facet state contains a regular facet', () => {
      it('generates a regular facet controller', () => {
        const facetId = 'regular_facet_id';
        setFacetState([{facetId, type: 'regular'}]);

        expect(facetGenerator.state.facets.length).toEqual(1);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingRegularFacet(engine, {facetId}).state
        );
      });
    });

    describe('when facet state contains a numeric facet', () => {
      it('generates a numeric facet controller', () => {
        const facetId = 'numeric_facet_id';
        setFacetState([{facetId, type: 'numericalRange'}]);

        expect(facetGenerator.state.facets.length).toEqual(1);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingNumericFacet(engine, {facetId}).state
        );
      });
    });

    describe('when facet state contains a date facet', () => {
      it('generates a date facet controller', () => {
        const facetId = 'date_facet_id';
        setFacetState([{facetId, type: 'dateRange'}]);

        expect(facetGenerator.state.facets.length).toEqual(1);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingDateFacet(engine, {facetId}).state
        );
      });
    });

    describe('when facet state contains multiple facets', () => {
      it('generates the proper facet controllers', () => {
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
        ];
        setFacetState(facets);

        expect(facetGenerator.state.facets.length).toEqual(3);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingRegularFacet(engine, {facetId: facets[0].facetId})
            .state
        );
        expect(facetGenerator.state.facets[1].state).toEqual(
          buildProductListingNumericFacet(engine, {facetId: facets[1].facetId})
            .state
        );
        expect(facetGenerator.state.facets[2].state).toEqual(
          buildProductListingDateFacet(engine, {facetId: facets[2].facetId})
            .state
        );
      });
    });
  });

  it('should generate category facet controllers', () => {
    // TODO
  });
});
