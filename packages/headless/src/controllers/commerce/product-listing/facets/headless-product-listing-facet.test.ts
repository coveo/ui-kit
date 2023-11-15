import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {FacetOptions} from '../../facets/core/headless-core-facet';
import {
  buildProductListingFacet,
  ProductListingFacet,
} from './headless-product-listing-facet';

describe('facet', () => {
  const facetId: string = 'some_field';
  let options: FacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: ProductListingFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildProductListingFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [buildMockCommerceFacetResponse({facetId})];
  }

  beforeEach(() => {
    options = {
      facetId,
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

  describe('#toggleSelect', () => {
    it('dispatches a fetch product listing', () => {
      const facetValue = buildMockCommerceFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });

    it('when state is "selected", dispatches #logFacetDeselect', () => {
      const facetValue = buildMockCommerceFacetValue({state: 'selected'});
      facet.toggleSelect(facetValue);

      const expectedAnalyticsActionType = logFacetDeselect({
        facetId,
        facetValue: 'some_field',
      }).pending.type;

      expect(
        engine.actions.find((a) => a.type === expectedAnalyticsActionType)
      ).toBeTruthy();
    });

    it('when state is "idle", dispatches #logFacetSelect', () => {
      const facetValue = buildMockCommerceFacetValue({state: 'idle'});
      facet.toggleSelect(facetValue);

      const expectedAnalyticsActionType = logFacetSelect({
        facetId,
        facetValue: 'some_field',
      }).pending.type;

      expect(
        engine.actions.find((a) => a.type === expectedAnalyticsActionType)
      ).toBeTruthy();
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches a fetch product listing', () => {
      const facetValue = buildMockCommerceFacetValue({value: 'TED'});
      facet.toggleExclude(facetValue);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });

    it('when state is "excluded", dispatches #logFacetDeselect', () => {
      const facetValue = buildMockCommerceFacetValue({state: 'excluded'});
      facet.toggleExclude(facetValue);

      const expectedAnalyticsActionType = logFacetDeselect({
        facetId,
        facetValue: 'some_field',
      }).pending.type;

      expect(
        engine.actions.find((a) => a.type === expectedAnalyticsActionType)
      ).toBeTruthy();
    });

    it('when state is "idle", dispatches #logFacetExclude', () => {
      const facetValue = buildMockCommerceFacetValue({state: 'idle'});
      facet.toggleExclude(facetValue);

      const expectedAnalyticsActionType = logFacetExclude({
        facetId,
        facetValue: 'some_field',
      }).pending.type;

      expect(
        engine.actions.find((a) => a.type === expectedAnalyticsActionType)
      ).toBeTruthy();
    });
  });

  it('#toggleSingleSelect dispatches a fetchProductListing', () => {
    const facetValue = buildMockCommerceFacetValue({value: 'TED'});
    facet.toggleSingleSelect(facetValue);

    expect(engine.actions).toContainEqual(
      expect.objectContaining({
        type: fetchProductListing.pending.type,
      })
    );
  });

  it('#toggleSingleExclude dispatches a fetchProductListing', () => {
    const facetValue = buildMockCommerceFacetValue({value: 'TED'});
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

  it('#showLessValues dispatches a fetchProductListing', () => {
    facet.showLessValues();

    expect(engine.actions).toContainEqual(
      expect.objectContaining({
        type: fetchProductListing.pending.type,
      })
    );
  });
});
