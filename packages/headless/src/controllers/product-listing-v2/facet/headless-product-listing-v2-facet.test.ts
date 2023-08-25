import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions';
import {FacetRequest} from '../../../features/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../features/product-listing/v2/product-listing-v2-actions';
import {ProductListingV2AppState} from '../../../state/commerce-app-state';
import {
  buildMockCommerceEngine,
  MockCommerceEngine,
} from '../../../test/mock-engine';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {buildMockProductListingV2State} from '../../../test/mock-product-listing-v2-state';
import {
  buildFacet,
  Facet,
  FacetOptions,
} from './headless-product-listing-v2-facet';

describe('facet', () => {
  const facetId = '1';
  let options: FacetOptions;
  let state: ProductListingV2AppState;
  let engine: MockCommerceEngine;
  let facet: Facet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<FacetRequest> = {}) {
    state.facetSet[facetId] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId, ...config}),
    });
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'author',
    };

    state = buildMockProductListingV2State();
    setFacetRequest();

    initFacet();
  });

  it('renders', () => {
    expect(facet).toBeTruthy();
  });

  it('exposes a #subscribe method', () => {
    expect(facet.subscribe).toBeTruthy();
  });

  it('registers a facet with the passed options and the default values of unspecified options', () => {
    const action = registerFacet({
      field: 'author',
      facetId,
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      sortCriteria: 'automatic',
    });

    expect(engine.actions).toContainEqual(action);
  });

  it('when the product listing response is empty, the facet #state.values is an empty array', () => {
    expect(state.productListing.facets).toEqual([]);
    expect(facet.state.values).toEqual([]);
  });

  it('when the product listing response has a facet, the facet #state.values contains the same values', () => {
    const values = [buildMockFacetValue()];
    const facetResponse = buildMockFacetResponse({
      facetId,
      values,
    });

    state.productListing.facets = [facetResponse];
    expect(facet.state.values).toBe(values);
  });

  describe('#toggleSelect', () => {
    it('dispatches a fetch product listing', () => {
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches a fetch product listing', () => {
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleExclude(facetValue);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });
  });

  it('#toggleSingleSelect dispatches a fetchProductListing', () => {
    const facetValue = buildMockFacetValue({value: 'TED'});
    facet.toggleSingleSelect(facetValue);

    expect(engine.actions).toContainEqual(
      expect.objectContaining({
        type: fetchProductListing.pending.type,
      })
    );
  });

  it('#toggleSingleExclude dispatches a fetchProductListing', () => {
    const facetValue = buildMockFacetValue({value: 'TED'});
    facet.toggleSingleExclude(facetValue);

    expect(engine.actions).toContainEqual(
      expect.objectContaining({
        type: fetchProductListing.pending.type,
      })
    );
  });

  it('#deselectAll dispatches a fetchProductListing', () => {
    facet.deselectAll();

    expect(engine.actions).toContainEqual(
      expect.objectContaining({
        type: fetchProductListing.pending.type,
      })
    );
  });

  it('#showMoreValues dispatches a fetchProductListing', () => {
    facet.showMoreValues();

    expect(engine.actions).toContainEqual(
      expect.objectContaining({
        type: fetchProductListing.pending.type,
      })
    );
  });

  it('#showLessValues  dispatches a fetchProductListing', () => {
    facet.showLessValues();

    expect(engine.actions).toContainEqual(
      expect.objectContaining({
        type: fetchProductListing.pending.type,
      })
    );
  });
});
