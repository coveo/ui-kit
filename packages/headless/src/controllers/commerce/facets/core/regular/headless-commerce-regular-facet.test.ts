import {Action} from '@reduxjs/toolkit';
import {CommerceFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/facets/facet-set/facet-set-actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {MockCommerceEngine, buildMockCommerceEngine} from '../../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {CoreCommerceFacetOptions} from '../headless-core-commerce-facet';
import {
  CommerceRegularFacet,
  buildCommerceRegularFacet,
} from './headless-commerce-regular-facet';

describe('CommerceRegularFacet', () => {
  const facetId: string = 'regular_facet_id';
  let options: CoreCommerceFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceRegularFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildCommerceRegularFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceRegularFacetResponse({facetId}),
    ];
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
    it('dispatches a #toggleSelectFacetValue', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expectContainAction(toggleSelectFacetValue);
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches a #toggleExcludeFacetValue', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleExclude(facetValue);

      expectContainAction(toggleExcludeFacetValue);
    });
  });
});
