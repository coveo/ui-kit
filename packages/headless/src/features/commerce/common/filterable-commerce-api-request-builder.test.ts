import {
  defaultNodeJSNavigatorContextProvider,
  type NavigatorContext,
} from '../../../app/navigator-context-provider.js';
import {buildMockPaginatedCommerceAPIRequest} from '../../../test/mock-commerce-api-request.js';
import {buildMockCommerceFacetRequest} from '../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceFacetSlice} from '../../../test/mock-commerce-facet-slice.js';
import {
  buildMockCommerceNumericFacetValue,
  buildMockCommerceRegularFacetValue,
} from '../../../test/mock-commerce-facet-value.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {getCartInitialState} from '../context/cart/cart-state.js';
import {getContextInitialState} from '../context/context-state.js';
import {
  type CommerceFacetSlice,
  getCommerceFacetSetInitialState,
} from '../facets/facet-set/facet-set-state.js';
import {getCommercePaginationInitialState} from '../pagination/pagination-state.js';
import {SortBy, type SortCriterion, SortDirection} from '../sort/sort.js';
import {getCommerceSortInitialState} from '../sort/sort-state.js';
import {
  buildFilterableCommerceAPIRequest,
  type StateNeededForFilterableCommerceAPIRequest,
} from './filterable-commerce-api-request-builder.js';
import {buildPaginatedCommerceAPIRequest} from './paginated-commerce-api-request-builder.js';

vi.mock('./paginated-commerce-api-request-builder.js');

describe('#buildFilterableCommerceAPIRequest', () => {
  let state: StateNeededForFilterableCommerceAPIRequest;
  let navigatorContext: NavigatorContext;

  const mockPaginatedCommerceAPIRequest =
    buildMockPaginatedCommerceAPIRequest();

  const setState = (
    configuration?: Partial<StateNeededForFilterableCommerceAPIRequest>
  ) => {
    state = {
      configuration: getConfigurationInitialState(),
      cart: getCartInitialState(),
      commerceContext: getContextInitialState(),
      commercePagination: getCommercePaginationInitialState(),
      commerceFacetSet: getCommerceFacetSetInitialState(),
      commerceSort: getCommerceSortInitialState(),
      ...configuration,
    };
  };

  const setNavigatorContext = (configuration?: Partial<NavigatorContext>) => {
    navigatorContext = {
      ...defaultNodeJSNavigatorContextProvider(),
      ...configuration,
    };
  };
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(buildPaginatedCommerceAPIRequest).mockReturnValue(
      mockPaginatedCommerceAPIRequest
    );
    setState();
    setNavigatorContext();
  });

  it('sets base properties to the value returned by #buildPaginatedCommerceAPIRequest(#state, #navigatorContext)', () => {
    const {
      facets: _facets,
      sort: _sort,
      ...restOfRequest
    } = buildFilterableCommerceAPIRequest(state, navigatorContext);

    expect(buildPaginatedCommerceAPIRequest).toHaveBeenCalledWith(
      state,
      navigatorContext
    );
    expect(restOfRequest).toEqual(mockPaginatedCommerceAPIRequest);
  });

  it('when #state.facetOrder is defined but #state.commerceFacetSet is not, sets #facets to an empty array', () => {
    state.facetOrder = ['facet_id'];
    delete state.commerceFacetSet;

    const request = buildFilterableCommerceAPIRequest(state, navigatorContext);

    expect(request.facets).toEqual([]);
  });

  it('when #state.commerceFacetSet is defined but #state.facetOrder is not, sets #facets to an empty array', () => {
    state.commerceFacetSet = {
      facet_id: buildMockCommerceFacetSlice(),
    };
    delete state.facetOrder;

    const request = buildFilterableCommerceAPIRequest(state, navigatorContext);

    expect(request.facets).toEqual([]);
  });

  describe('when #state.facetOrder and #state.commerceFacetSet are both defined', () => {
    let facet1: CommerceFacetSlice;
    let facet2: CommerceFacetSlice;

    const facetId1 = 'some-facet-id-1';
    const facetId2 = 'some-facet-id-2';

    beforeEach(() => {
      facet1 = buildMockCommerceFacetSlice({
        request: {
          ...buildMockCommerceFacetRequest({
            facetId: facetId1,
            values: [buildMockCommerceNumericFacetValue()],
          }),
        },
      });

      facet2 = buildMockCommerceFacetSlice({
        request: {
          ...buildMockCommerceFacetRequest({
            facetId: facetId2,
            values: [buildMockCommerceRegularFacetValue()],
          }),
        },
      });

      state.facetOrder = [facetId1, facetId2];

      state.commerceFacetSet = {
        [facetId1]: facet1,
        [facetId2]: facet2,
      };
    });

    it('when #state.commerceFacetSet[f].values is non-empty, includes #state.commerceFacetSet[f] in the facets array', () => {
      const request = buildFilterableCommerceAPIRequest(
        state,
        navigatorContext
      );

      expect(request.facets).toEqual([facet1.request, facet2.request]);
    });

    it('when #state.commerceFacetSet[e].values is empty, does not include #state.commerceFacetSet[e] in the #facets array', () => {
      const facetId3 = 'some-facet-id-3';
      const facet3 = buildMockCommerceFacetSlice({
        request: {
          ...buildMockCommerceFacetRequest({
            facetId: facetId3,
          }),
          values: [],
        },
      });

      state.facetOrder = [facet1.request.facetId, facet2.request.facetId];

      state.commerceFacetSet![facetId3] = facet3;
      state.facetOrder.push(facetId3);

      const request = buildFilterableCommerceAPIRequest(
        state,
        navigatorContext
      );

      expect(request.facets).toEqual([facet1.request, facet2.request]);
    });

    it('when #state.manualNumericFacetSet[f].values and #state.commerceFacetSet[f].values are both non-empty, uses #state.manualNumericFacetSet[e].values for the corresponding element in the #facets array', () => {
      state.manualNumericFacetSet = {
        [facetId1]: {
          manualRange: {
            end: 20,
            endInclusive: false,
            start: 11,
            state: 'selected',
          },
        },
      };

      const request = buildFilterableCommerceAPIRequest(
        state,
        navigatorContext
      );

      const facet1InRequest = request.facets?.find(
        (facet) => facet.facetId === facetId1
      );

      expect(facet1InRequest?.values).toEqual([
        {
          start: 11,
          end: 20,
          endInclusive: false,
          state: 'selected',
        },
      ]);
    });
  });

  describe('when #state.commerceSort is defined', () => {
    beforeEach(() => {
      delete state.facetOrder;
      delete state.commerceFacetSet;
    });

    it('sets #sort.sortCriteria to #state.commerceSort.appliedSort.by', () => {
      state.commerceSort = {
        ...getCommerceSortInitialState(),
        appliedSort: {
          by: SortBy.Relevance,
        },
      };

      const request = buildFilterableCommerceAPIRequest(
        state,
        navigatorContext
      );

      expect(request.sort).toEqual({sortCriteria: SortBy.Relevance});
    });

    it('when #state.commerceSort.appliedSort.by is SortBy.Fields, sets #sort.sortCriteria.fields', () => {
      const sortCriterion: SortCriterion = {
        by: SortBy.Fields,
        fields: [
          {
            name: 'field_name',
            direction: SortDirection.Ascending,
            displayName: 'field_display_name',
          },
        ],
      };
      state.commerceSort = {
        ...getCommerceSortInitialState(),
        appliedSort: sortCriterion,
      };

      const request = buildFilterableCommerceAPIRequest(
        state,
        navigatorContext
      );

      expect(request.sort?.fields).toEqual([
        {
          field: sortCriterion.fields[0].name,
          direction: sortCriterion.fields[0].direction,
        },
      ]);
    });
  });
});
