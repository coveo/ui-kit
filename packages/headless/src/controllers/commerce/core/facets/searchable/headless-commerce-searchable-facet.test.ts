import {executeCommerceFacetSearch} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {
  AnyFacetValueResponse,
  RegularFacetResponse,
} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/facets/facet-set/facet-set-actions';
import {AnyFacetValueRequest} from '../../../../../features/facets/generic/interfaces/generic-facet-request';
import {buildMockCommerceFacetRequest} from '../../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search';
import {commonOptions} from '../../../product-listing/facets/headless-product-listing-facet-options';
import {CoreCommerceFacetOptions} from '../headless-core-commerce-facet';
import {
  CommerceSearchableFacet,
  CommerceSearchableFacetOptions,
  buildCommerceSearchableFacet,
} from './headless-commerce-searchable-facet';

jest.mock(
  '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
);

describe('CommerceSearchableFacet', () => {
  const facetId: string = 'searchable_facet_id';
  let engine: MockedCommerceEngine;
  let options: CoreCommerceFacetOptions & CommerceSearchableFacetOptions;
  let facet: CommerceSearchableFacet<
    AnyFacetValueRequest,
    AnyFacetValueResponse
  >;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initCommerceSearchableFacet() {
    facet = buildCommerceSearchableFacet(engine, options);
  }

  function setFacetState(config: Partial<RegularFacetResponse> = {}) {
    engine.state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    options.facetResponseSelector = () =>
      buildMockCommerceRegularFacetResponse({
        facetId,
        values: [buildMockCommerceRegularFacetValue()],
      });
  }

  function setFacetSearchState(isLoading: boolean = false) {
    engine.state.facetSearchSet[facetId] = buildMockFacetSearch({isLoading});
  }

  beforeEach(() => {
    jest.resetAllMocks();

    options = {
      facetId,
      toggleExcludeActionCreator: toggleExcludeFacetValue,
      toggleSelectActionCreator: toggleSelectFacetValue,
      ...commonOptions,
    };

    initEngine();
    setFacetState();
    setFacetSearchState();

    initCommerceSearchableFacet();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(facet).toBeTruthy();
    });
  });

  it('#facetSearch exposes the facet search controller', () => {
    expect(facet.facetSearch).toBeTruthy();

    facet.facetSearch.search();
    expect(executeCommerceFacetSearch).toHaveBeenCalled();
  });

  it('#state exposes #facetSearch', () => {
    expect(facet.state.facetSearch).toBeTruthy();
    expect(facet.state.facetSearch.isLoading).toBe(false);

    setFacetSearchState(true);
    initCommerceSearchableFacet();
    expect(facet.state.facetSearch.isLoading).toBe(true);
  });
});
