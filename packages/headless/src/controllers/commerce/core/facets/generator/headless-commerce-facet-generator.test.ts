import {commerceFacetSetReducer as commerceFacetSet} from '../../../../../features/commerce/facets/facet-set/facet-set-slice';
import {CommerceFacetSetState} from '../../../../../features/commerce/facets/facet-set/facet-set-state';
import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {facetOrderReducer as facetOrder} from '../../../../../features/facets/facet-order/facet-order-slice';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {
  buildMockCommerceRegularFacetResponse,
  buildMockCommerceNumericFacetResponse,
  buildMockCommerceDateFacetResponse,
  buildMockCommerceCategoryFacetResponse,
} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {MockCommerceEngine} from '../../../../../test/mock-engine';
import {buildMockCommerceEngine} from '../../../../../test/mock-engine';
import {buildProductListingCategoryFacet} from '../../../product-listing/facets/headless-product-listing-category-facet';
import {buildProductListingDateFacet} from '../../../product-listing/facets/headless-product-listing-date-facet';
import {buildProductListingNumericFacet} from '../../../product-listing/facets/headless-product-listing-numeric-facet';
import {buildProductListingRegularFacet} from '../../../product-listing/facets/headless-product-listing-regular-facet';
import {
  buildCommerceFacetGenerator,
  CommerceFacetGenerator,
  CommerceFacetGeneratorOptions,
} from './headless-commerce-facet-generator';

describe('CommerceFacetGenerator', () => {
  let engine: MockCommerceEngine;
  let options: CommerceFacetGeneratorOptions;
  let facetGenerator: CommerceFacetGenerator;

  function initFacetGenerator(facets: {facetId: string; type: FacetType}[]) {
    const mockState = buildMockCommerceState();
    const facetResponses = [];

    for (const facet of facets) {
      const {facetId} = facet;
      switch (facet.type) {
        case 'regular':
          facetResponses.push(
            buildMockCommerceRegularFacetResponse({
              facetId,
              field: facetId,
            })
          );
          break;
        case 'numericalRange':
          facetResponses.push(
            buildMockCommerceNumericFacetResponse({
              facetId,
              field: facetId,
            })
          );
          break;
        case 'dateRange':
          facetResponses.push(
            buildMockCommerceDateFacetResponse({
              facetId,
              field: facetId,
            })
          );
          break;
        case 'hierarchical':
          facetResponses.push(
            buildMockCommerceCategoryFacetResponse({
              facetId,
              field: facetId,
            })
          );
          break;
        default:
          break;
      }
    }

    const commerceFacetSet: CommerceFacetSetState = {};

    for (const facet of facetResponses) {
      commerceFacetSet[facet.facetId] = {
        request: buildMockCommerceFacetRequest({facetId: facet.facetId}),
      };
    }

    engine = buildMockCommerceEngine({
      state: {
        ...mockState,
        productListing: {
          ...mockState.productListing,
          facets: facetResponses,
        },
        facetOrder: facets.map((facet) => facet.facetId),
        commerceFacetSet,
      },
    });

    options = {
      buildNumericFacet: buildProductListingNumericFacet,
      buildRegularFacet: buildProductListingRegularFacet,
      buildDateFacet: buildProductListingDateFacet,
      buildCategoryFacet: buildProductListingCategoryFacet,
    };

    facetGenerator = buildCommerceFacetGenerator(engine, options);
  }

  describe('upon initialization', () => {
    describe('regardless of the current facet state', () => {
      beforeEach(() => {
        initFacetGenerator([]);
      });

      afterEach(() => {
        jest.clearAllMocks();
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

    describe('when facet state contains no facet', () => {
      it('generates no facet controller', () => {
        initFacetGenerator([]);

        expect(facetGenerator.state.facets.length).toEqual(0);
      });
    });

    describe('when facet state contain a regular facet', () => {
      it('generates a regular facet controller', () => {
        const facetId = 'regular_facet_id';
        initFacetGenerator([{facetId, type: 'regular'}]);

        expect(facetGenerator.state.facets.length).toEqual(1);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingRegularFacet(engine, {facetId}).state
        );
      });
    });

    describe('when facet state contains a numeric facet', () => {
      it('generates a numeric facet controller', () => {
        const facetId = 'numeric_facet_id';
        initFacetGenerator([{facetId, type: 'numericalRange'}]);

        expect(facetGenerator.state.facets.length).toEqual(1);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingNumericFacet(engine, {facetId}).state
        );
      });
    });

    describe('when facet state contains a date facet', () => {
      it('generates a date facet controller', () => {
        const facetId = 'date_facet_id';
        initFacetGenerator([{facetId, type: 'dateRange'}]);

        expect(facetGenerator.state.facets.length).toEqual(1);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingDateFacet(engine, {facetId}).state
        );
      });
    });

    describe('when facet state contains a category facet', () => {
      it('generates a category facet controller', () => {
        const facetId = 'category_facet_id';
        initFacetGenerator([{facetId, type: 'hierarchical'}]);

        expect(facetGenerator.state.facets.length).toEqual(1);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingCategoryFacet(engine, {facetId}).state
        );
      });
    });

    describe('when facet state contains multiple facets', () => {
      it('generates multiple facet controllers', () => {
        const facetIds = [
          'facet_id_1',
          'facet_id_2',
          'facet_id_3',
          'facet_id_4',
        ];
        initFacetGenerator([
          {facetId: facetIds[0], type: 'regular'},
          {facetId: facetIds[1], type: 'numericalRange'},
          {facetId: facetIds[2], type: 'dateRange'},
          {facetId: facetIds[3], type: 'hierarchical'},
        ]);

        expect(facetGenerator.state.facets.length).toEqual(4);
        expect(facetGenerator.state.facets[0].state).toEqual(
          buildProductListingRegularFacet(engine, {facetId: facetIds[0]}).state
        );
        expect(facetGenerator.state.facets[1].state).toEqual(
          buildProductListingNumericFacet(engine, {facetId: facetIds[1]}).state
        );
        expect(facetGenerator.state.facets[2].state).toEqual(
          buildProductListingDateFacet(engine, {facetId: facetIds[2]}).state
        );
        expect(facetGenerator.state.facets[3].state).toEqual(
          buildProductListingCategoryFacet(engine, {facetId: facetIds[3]}).state
        );
      });
    });
  });
});
