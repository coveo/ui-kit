import {
  buildFacet,
  Facet,
  FacetOptions,
} from './headless-product-listing-facet';
import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../test/mock-engine';
import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {FacetRequest} from '../../../features/facets/facet-set/interfaces/request';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';

import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import {ProductListingAppState} from '../../../state/product-listing-app-state';
import {buildMockProductListingState} from '../../../test/mock-product-listing-state';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';

describe('facet', () => {
  const facetId = '1';
  let options: FacetOptions;
  let state: ProductListingAppState;
  let engine: MockProductListingEngine;
  let facet: Facet;

  function initFacet() {
    engine = buildMockProductListingEngine({state});
    facet = buildFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<FacetRequest> = {}) {
    state.facetSet[facetId] = buildMockFacetRequest({facetId, ...config});
    state.facetSearchSet[facetId] = buildMockFacetSearch();
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'author',
      sortCriteria: 'score',
      facetSearch: {},
    };

    state = buildMockProductListingState();
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
      ...options,
      facetId,
      delimitingCharacter: '>',
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
    });

    expect(engine.actions).toContainEqual(action);
  });

  it('when the product listing response is empty, the facet #state.values is an empty array', () => {
    expect(state.productListing.facets.results).toEqual([]);
    expect(facet.state.values).toEqual([]);
  });

  it('when the product listing response has a facet, the facet #state.values contains the same values', () => {
    const values = [buildMockFacetValue()];
    const facetResponse = buildMockFacetResponse({
      facetId,
      values,
    });

    state.productListing.facets = {results: [facetResponse]};
    expect(facet.state.values).toBe(values);
  });

  describe('#toggleSelect', () => {
    it('dispatches a fetch product listing', () => {
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      const action = engine.actions.find(
        (a) => a.type === fetchProductListing.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  it('#toggleSingleSelect dispatches a fetchProductListing', () => {
    const facetValue = buildMockFacetValue({value: 'TED'});
    facet.toggleSingleSelect(facetValue);

    const action = engine.actions.find(
      (a) => a.type === fetchProductListing.pending.type
    );
    expect(action).toBeTruthy();
  });

  it('#deselectAll dispatches a fetchProductListing', () => {
    facet.deselectAll();

    const action = engine.actions.find(
      (a) => a.type === fetchProductListing.pending.type
    );
    expect(engine.actions).toContainEqual(action);
  });

  it('#sortBy dispatches a fetchProductListing', () => {
    facet.sortBy('score');
    const action = engine.actions.find(
      (a) => a.type === fetchProductListing.pending.type
    );

    expect(engine.actions).toContainEqual(action);
  });

  it('#showMoreValues dispatches a fetchProductListing', () => {
    facet.showMoreValues();

    const action = engine.actions.find(
      (a) => a.type === fetchProductListing.pending.type
    );
    expect(action).toBeTruthy();
  });

  it('#showLessValues  dispatches a fetchProductListing', () => {
    facet.showLessValues();
    const action = engine.actions.find(
      (a) => a.type === fetchProductListing.pending.type
    );
    expect(action).toBeTruthy();
  });
});
