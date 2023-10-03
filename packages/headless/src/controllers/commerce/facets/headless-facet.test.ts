import {fetchProductListing} from '../../../features/commerce/product-listing/product-listing-actions';
import {
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
} from '../../../features/facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {FacetRequest} from '../../../features/facets/facet-set/interfaces/request';
import {CommerceAppState} from '../../../state/commerce-app-state';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../test';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {buildFacet, Facet, FacetOptions} from './headless-facet';

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

    it('when state is "selected", dispatches #logFacetDeselect', () => {
      const facetValue = buildMockFacetValue({state: 'selected'});
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
      const facetValue = buildMockFacetValue({state: 'idle'});
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
      const facetValue = buildMockFacetValue({value: 'TED'});
      facet.toggleExclude(facetValue);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchProductListing.pending.type,
        })
      );
    });

    it('when state is "excluded", dispatches #logFacetDeselect', () => {
      const facetValue = buildMockFacetValue({state: 'excluded'});
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
      const facetValue = buildMockFacetValue({state: 'idle'});
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

  it('#showLessValues dispatches a fetchProductListing', () => {
    facet.showLessValues();

    expect(engine.actions).toContainEqual(
      expect.objectContaining({
        type: fetchProductListing.pending.type,
      })
    );
  });
});
