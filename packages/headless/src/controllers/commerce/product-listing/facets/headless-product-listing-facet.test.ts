import {Action} from '@reduxjs/toolkit';
import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
} from '../../../../features/facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  Facet,
  FacetOptions,
  FacetValueState,
} from '../../facets/core/headless-core-facet';
import {buildProductListingFacet} from './headless-product-listing-facet';

describe('facet', () => {
  const facetId: string = 'some_field';
  let options: FacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: Facet;

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

  const expectContainAction = (action: Action) => {
    expect(engine.actions).toContainEqual(
      expect.objectContaining({
        type: action.type,
      })
    );
  };

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

      expectContainAction(fetchProductListing.pending);
    });

    it.each([
      {state: 'selected', expected: logFacetDeselect},
      {state: 'excluded', expected: logFacetSelect},
      {state: 'idle', expected: logFacetSelect},
    ])('when state is "$state", dispatches #$expected', ({state, expected}) => {
      const facetValue = buildMockCommerceFacetValue({
        state: state as FacetValueState,
      });
      facet.toggleSelect(facetValue);

      expectContainAction(
        expected({
          facetId,
          facetValue: 'some_field',
        }).pending
      );
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches a fetch product listing', () => {
      const facetValue = buildMockCommerceFacetValue({value: 'TED'});
      facet.toggleExclude(facetValue);

      expectContainAction(fetchProductListing.pending);
    });

    it.each([
      {state: 'selected', expected: logFacetExclude},
      {state: 'excluded', expected: logFacetDeselect},
      {state: 'idle', expected: logFacetExclude},
    ])('when state is "$state", dispatches #$expected', ({state, expected}) => {
      const facetValue = buildMockCommerceFacetValue({
        state: state as FacetValueState,
      });
      facet.toggleExclude(facetValue);

      expectContainAction(
        expected({
          facetId,
          facetValue: 'some_field',
        }).pending
      );
    });
  });

  it.each([
    {expected: fetchProductListing},
    {expected: logFacetClearAll(facetId)},
  ])('#deselectAll dispatches a #$expected', ({expected}) => {
    facet.deselectAll();

    expectContainAction(expected.pending);
  });

  it.each([
    {expected: fetchProductListing},
    {expected: logFacetShowMore(facetId)},
  ])('#showMoreValues dispatches a #$expected', ({expected}) => {
    facet.showMoreValues();

    expectContainAction(expected.pending);
  });

  it.each([
    {expected: fetchProductListing},
    {expected: logFacetShowLess(facetId)},
  ])('#showLessValues dispatches a #$expected', ({expected}) => {
    facet.showLessValues();

    expectContainAction(expected.pending);
  });
});
