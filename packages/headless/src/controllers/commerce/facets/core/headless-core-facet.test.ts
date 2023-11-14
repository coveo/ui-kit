import {facetId} from '../../../core/facets/_common/facet-option-definitions';
import {buildCoreFacet, Facet, FacetOptions} from './headless-core-facet';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {buildMockFacetValue} from '../../../../test/mock-facet-value';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {logFacetDeselect} from '../../../../features/facets/facet-set/facet-set-product-listing-v2-analytics-actions';


describe('CoreCommerceFacet', () => {
  const field = 'some_field';
  let options: FacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: Facet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildCoreFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[field] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({field, ...config}),
    });
  }

  beforeEach(() => {
    options = {
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
        field,
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
