import {AnyFacetValueResponse} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/facets/facet-set/facet-set-actions';
import {AnyFacetValueRequest} from '../../../../../features/facets/generic/interfaces/generic-facet-request';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search';
import {CoreCommerceFacetOptions} from '../headless-core-commerce-facet';
import * as CommerceFacetSearch from './headless-commerce-facet-search';
import {
  CommerceSearchableFacet,
  CommerceSearchableFacetOptions,
  buildCommerceSearchableFacet,
} from './headless-commerce-searchable-facet';

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

  function setFacetSearchState(preloadedState = buildMockFacetSearch()) {
    engine.state.facetSearchSet[facetId] = preloadedState;
  }

  beforeEach(() => {
    jest.resetAllMocks();

    options = {
      facetId,
      facetResponseSelector: jest.fn(),
      fetchResultsActionCreator: jest.fn(),
      isFacetLoadingResponseSelector: jest.fn(),
      toggleExcludeActionCreator: jest.mocked(toggleExcludeFacetValue),
      toggleSelectActionCreator: jest.mocked(toggleSelectFacetValue),
    };

    initEngine();
    setFacetSearchState();

    initCommerceSearchableFacet();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(facet).toBeTruthy();
    });
  });

  it('#facetSearch exposes the facet search controller', () => {
    jest.spyOn(CommerceFacetSearch, 'buildCommerceFacetSearch');
    initCommerceSearchableFacet();

    expect(CommerceFacetSearch.buildCommerceFacetSearch).toHaveBeenCalled();
  });

  it('#state exposes #facetSearch', () => {
    expect(facet.state.facetSearch).toBeTruthy();
  });
});
