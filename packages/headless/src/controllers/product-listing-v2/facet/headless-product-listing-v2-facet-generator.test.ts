import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {facetSetReducer as facetSet} from '../../../features/facets/facet-set/facet-set-slice';
import {ProductListingV2AppState} from '../../../state/commerce-app-state';
import {buildMockCommerceEngine} from '../../../test/mock-engine';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {buildMockProductListingV2State} from '../../../test/mock-product-listing-v2-state';
import {
  buildFacetGenerator,
  FacetGenerator,
} from './headless-product-listing-v2-facet-generator';

describe('automatic facets', () => {
  let engine: CommerceEngine;
  let state: ProductListingV2AppState;
  let facetGenerator: FacetGenerator;

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    state = buildMockProductListingV2State();
    facetGenerator = buildFacetGenerator(engine);
  });

  it('should add the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      facetSet,
      configuration,
    });
  });

  it('when the product listing response is empty, the facet #state.facets is an empty array', () => {
    expect(facetGenerator.state.facets).toEqual([]);
  });

  it('when the product listing response has facets, the facet #state.facets contains matching controllers', () => {
    const facetResponse = buildMockFacetResponse({
      facetId: 'some-facet-id',
      values: [buildMockFacetValue()],
    });

    state.productListing.facets = [facetResponse];
    expect(facetGenerator.state.facets).toEqual([]);
  });
});
