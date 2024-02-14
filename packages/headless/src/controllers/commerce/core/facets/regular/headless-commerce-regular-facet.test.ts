import {CommerceFacetRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/facets/facet-set/facet-set-actions';
import {CommerceAppState} from '../../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {commonOptions} from '../../../product-listing/facets/headless-product-listing-facet-options';
import {
  CommerceRegularFacet,
  CommerceRegularFacetOptions,
  buildCommerceRegularFacet,
} from './headless-commerce-regular-facet';

jest.mock('../../../../../features/facets/facet-set/facet-set-actions');

describe('CommerceRegularFacet', () => {
  const facetId: string = 'regular_facet_id';
  let options: CommerceRegularFacetOptions;
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let facet: CommerceRegularFacet;

  function initFacet() {
    engine = buildMockCommerceEngine(state);
    facet = buildCommerceRegularFacet(engine, options);
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceRegularFacetResponse({facetId}),
    ];
  }

  beforeEach(() => {
    options = {
      facetId,
      ...commonOptions,
    };

    state = buildMockCommerceState();
    setFacetRequest();

    initFacet();
  });

  it('initializes', () => {
    expect(facet).toBeTruthy();
  });

  it('exposes #subscribe method', () => {
    expect(facet.subscribe).toBeTruthy();
  });

  describe('#toggleSelect', () => {
    it('dispatches a #toggleSelectFacetValue', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleSelect(facetValue);

      expect(toggleSelectFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: facetValue,
      });
    });
  });

  describe('#toggleExclude', () => {
    it('dispatches a #toggleExcludeFacetValue', () => {
      const facetValue = buildMockCommerceRegularFacetValue({value: 'TED'});
      facet.toggleExclude(facetValue);

      expect(toggleExcludeFacetValue).toHaveBeenCalledWith({
        facetId,
        selection: facetValue,
      });
    });
  });
});
