import {commerceFacetSetReducer as commerceFacetSet} from '../../../../../features/commerce/facets/facet-set/facet-set-slice';
import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {facetOrderReducer as facetOrder} from '../../../../../features/facets/facet-order/facet-order-slice';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {
  buildMockCommerceRegularFacetResponse,
  buildMockCommerceNumericFacetResponse,
  buildMockCommerceDateFacetResponse,
} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2';
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
  let options: CommerceFacetGeneratorOptions;
  let facetGenerator: CommerceFacetGenerator;

  function initFacetGenerator(
    facetId: string = 'regular_facet_id',
    type: FacetType = 'regular'
  ) {
    const mockState = buildMockCommerceState();
    const facets = [];
    switch (type) {
      case 'regular':
        facets.push(
          buildMockCommerceRegularFacetResponse({
            facetId,
            field: 'some_regular_field',
          })
        );
        break;
      case 'numericalRange':
        facets.push(
          buildMockCommerceNumericFacetResponse({
            facetId,
            field: 'some_numeric_field',
          })
        );
        break;
      case 'dateRange':
        facets.push(
          buildMockCommerceDateFacetResponse({
            facetId,
            field: 'some_date_field',
          })
        );
        break;
      case 'hierarchical': // TODO
      default:
        break;
    }

    const state = {
      ...mockState,
      productListing: {
        ...mockState.productListing,
        facets: [
          buildMockCommerceRegularFacetResponse({
            facetId,
            field: 'some_regular_field',
          }),
        ],
      },
      facetOrder: [facetId],
      commerceFacetSet: {
        [facetId]: {request: buildMockCommerceFacetRequest({facetId, type})},
      },
    };
    engine = buildMockCommerceEngine(state);
    options = {
      buildNumericFacet: buildProductListingNumericFacet,
      buildRegularFacet: buildProductListingRegularFacet,
      buildDateFacet: buildProductListingDateFacet,
    };
    facetGenerator = buildCommerceFacetGenerator(engine, options);
  }

  describe('upon initialization', () => {
    describe('regardless of the current facet state', () => {
      beforeEach(() => {
        initFacetGenerator();
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
    describe('when facet state contains regular facets', () => {
      it('generates regular facet controllers', () => {
        const facetId = 'regular_facet_id';
        initFacetGenerator(facetId, 'regular');

        expect(facetGenerator.state.facets.length).toEqual(1);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingRegularFacet(engine, {facetId}).state
        );
      });
    });

    describe('when facet state contains numeric facets', () => {
      it('generates numeric facet controllers', () => {
        const facetId = 'numeric_facet_id';
        initFacetGenerator(facetId, 'numericalRange');

        expect(facetGenerator.state.facets.length).toEqual(1);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingNumericFacet(engine, {facetId}).state
        );
      });
    });

    describe('when facet state contains date facets', () => {
      it('generates date facet controllers', () => {
        const facetId = 'date_facet_id';
        initFacetGenerator(facetId, 'dateRange');

        expect(facetGenerator.state.facets.length).toEqual(1);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingDateFacet(engine, {facetId}).state
        );
      });
    });
  });

  it('should generate category facet controllers', () => {
    // TODO
  });
});
