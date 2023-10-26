import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {registerFacet} from '../../../../features/facets/facet-set/facet-set-actions';
import {FacetRequest} from '../../../../features/facets/facet-set/interfaces/request';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../../../test/mock-facet-response';
import {buildMockFacetSlice} from '../../../../test/mock-facet-slice';
import {buildMockFacetValue} from '../../../../test/mock-facet-value';
import {
  buildFacet,
  Facet,
  FacetOptions,
} from './headless-product-listing-facet';

describe('Facet', () => {
  const facetId: string = 'some_facet_id';
  let options: FacetOptions;
  let state: CommerceAppState;
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
      field: 'some_field',
    };

    state = buildMockCommerceState();
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
      field: 'some_field',
      sortCriteria: 'automatic',
      resultsMustMatch: 'atLeastOneValue',
      facetId,
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
    });

    expect(engine.actions).toContainEqual(action);
  });

  it('when the product listing response is empty, the facet #state.values is an empty array', () => {
    expect(state.commerceFacets.facets).toEqual([]);
    expect(facet.state.values).toEqual([]);
  });

  it('when the commerce facets have a facet, the facet #state.values contains the same values', () => {
    const values = [buildMockFacetValue()];
    const facetResponse = buildMockFacetResponse({
      facetId,
      values,
    });

    state.commerceFacets.facets = [facetResponse];
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
