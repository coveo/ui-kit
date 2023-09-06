import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions';
import {FacetRequest} from '../../../features/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {ProductListingAppState} from '../../../state/product-listing-app-state';
import {
  buildMockProductListingEngine,
  MockProductListingEngine,
} from '../../../test/mock-engine';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {buildMockProductListingState} from '../../../test/mock-product-listing-state';
import * as FacetSearch from '../../core/facets/facet-search/specific/headless-facet-search';
import {
  buildFacet,
  Facet,
  FacetOptions,
} from './headless-product-listing-facet';

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
    state.facetSet[facetId] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId, ...config}),
    });
    state.facetSearchSet[facetId] = buildMockFacetSearch();
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'author',
      sortCriteria: 'score',
      resultsMustMatch: 'atLeastOneValue',
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
      field: 'author',
      sortCriteria: 'score',
      resultsMustMatch: 'atLeastOneValue',
      facetId,
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

  it('#sortBy dispatches a fetchProductListing', () => {
    facet.sortBy('score');

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

  it('exposes a #facetSearch property', () => {
    jest.spyOn(FacetSearch, 'buildFacetSearch');
    initFacet();
    expect(facet.facetSearch).toBeTruthy();
    expect(FacetSearch.buildFacetSearch).toHaveBeenCalled();
  });

  it('exposes a #facetSearch state', () => {
    expect(facet.state.facetSearch).toBeTruthy();
    expect(facet.state.facetSearch.values).toEqual([]);

    const fakeResponseValue = {
      count: 123,
      displayValue: 'foo',
      rawValue: 'foo',
    };
    engine.state.facetSearchSet[facetId].response.values = [fakeResponseValue];

    expect(facet.state.facetSearch.values[0]).toMatchObject(fakeResponseValue);
  });
});
