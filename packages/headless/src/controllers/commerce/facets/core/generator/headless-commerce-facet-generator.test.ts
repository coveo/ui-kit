import {commerceFacetSetReducer as commerceFacetSet} from '../../../../../features/commerce/facets/facet-set/facet-set-slice';
import {FacetType} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {facetOrderReducer as facetOrder} from '../../../../../features/facets/facet-order/facet-order-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {
  buildMockCommerceRegularFacetResponse,
  buildMockCommerceNumericFacetResponse,
} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {buildCommerceNumericFacet} from '../numeric/headless-commerce-numeric-facet';
import {buildCommerceRegularFacet} from '../regular/headless-commerce-regular-facet';
import {
  buildCommerceFacetGenerator,
  CommerceFacetGenerator,
  CommerceFacetGeneratorOptions,
} from './headless-commerce-facet-generator';

describe('CommerceFacetGenerator', () => {
  let engine: MockCommerceEngine;
  let options: CommerceFacetGeneratorOptions;
  let facetGenerator: CommerceFacetGenerator;

  function initFacetGenerator(
    facetId: string = 'regular_facet_id',
    type: FacetType = 'regular'
  ) {
    const mockState = buildMockCommerceState();
    const facets = [];
    switch (type) {
      case 'numericalRange':
        facets.push(
          buildMockCommerceNumericFacetResponse({
            facetId,
            field: 'some_numeric_field',
          })
        );
        break;
      case 'regular':
      case 'dateRange': // TODO
      case 'hierarchical': // TODO
      default:
        facets.push(
          buildMockCommerceRegularFacetResponse({
            facetId,
            field: 'some_regular_field',
          })
        );
        break;
    }
    engine = buildMockCommerceEngine({
      state: {
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
      },
    });
    options = {
      buildNumericFacet: buildCommerceNumericFacet,
      buildRegularFacet: buildCommerceRegularFacet,
    };
    facetGenerator = buildCommerceFacetGenerator(engine, options);
  }

  describe('in general', () => {
    beforeEach(() => {
      initFacetGenerator();
    });
    it('should add correct reducers to engine', () => {
      initFacetGenerator();

      expect(engine.addReducers).toHaveBeenCalledWith({
        facetOrder,
        commerceFacetSet,
      });
    });

    it('should expose a #subscribe method', () => {
      initFacetGenerator();

      expect(facetGenerator.subscribe).toBeTruthy();
    });
  });

  it('should generate regular facet controllers', () => {
    const facetId = 'regular_facet_id';
    initFacetGenerator(facetId, 'regular');

    expect(facetGenerator.state.facets.length).toEqual(1);
    expect(facetGenerator.state.facets[0].state).toEqual(
      buildCommerceRegularFacet(engine, {options: {facetId}}).state
    );
  });
  it('should generate numeric facet controllers', () => {
    const facetId = 'numeric_facet_id';
    initFacetGenerator(facetId, 'numericalRange');

    expect(facetGenerator.state.facets.length).toEqual(1);
    expect(facetGenerator.state.facets[0].state).toEqual(
      buildCommerceNumericFacet(engine, {options: {facetId}}).state
    );
  });

  it('should generate date facet controllers', () => {
    // TODO
  });

  it('should generate category facet controllers', () => {
    // TODO
  });
});
