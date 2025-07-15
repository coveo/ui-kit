import type {FacetSearchType} from '../../../api/commerce/facet-search/facet-search-request.js';
import type {FieldSuggestionsFacet} from '../../../api/commerce/search/query-suggest/query-suggest-response.js';
import {getFacetIdWithCommerceFieldSuggestionNamespace} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice.js';
import type {CommerceAppState} from '../../../state/commerce-app-state.js';
import {buildMockCategoryFacetSearch} from '../../../test/mock-category-facet-search.js';
import {buildMockCommerceFacetRequest} from '../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockFacetSearch} from '../../../test/mock-facet-search.js';
import {buildCategoryFilterSuggestions} from './headless-category-filter-suggestions.js';
import {buildFilterSuggestions} from './headless-filter-suggestions.js';
import {
  buildFilterSuggestionsGenerator,
  type FilterSuggestionsGenerator,
} from './headless-filter-suggestions-generator.js';

describe('FilterSuggestionsGenerator', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let filterSuggestionsGenerator: FilterSuggestionsGenerator;
  const commonOptions = {
    fetchProductsActionCreator: vi.fn(),
    facetResponseSelector: vi.fn(),
    isFacetLoadingResponseSelector: vi.fn(),
    facetSearch: {type: 'SEARCH' as FacetSearchType},
  };

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initFilterSuggestionsGenerator() {
    filterSuggestionsGenerator = buildFilterSuggestionsGenerator(engine);
  }

  function setFacetState(config: FieldSuggestionsFacet[] = []) {
    for (const facet of config) {
      const namespacedFacetId = getFacetIdWithCommerceFieldSuggestionNamespace(
        facet.facetId
      );
      state.fieldSuggestionsOrder.push(facet);
      if (facet.type === 'regular') {
        state.facetSearchSet[namespacedFacetId] = buildMockFacetSearch();
      } else {
        state.commerceFacetSet[facet.facetId] = {
          request: buildMockCommerceFacetRequest({
            facetId: facet.facetId,
            type: facet.type,
          }),
        };
        state.categoryFacetSearchSet[namespacedFacetId] =
          buildMockCategoryFacetSearch();
      }
    }
  }

  beforeEach(() => {
    vi.resetAllMocks();

    state = buildMockCommerceState();
    setFacetState();

    initEngine(state);
    initFilterSuggestionsGenerator();
  });

  it('initializes', () => {
    expect(filterSuggestionsGenerator).toBeTruthy();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      fieldSuggestionsOrder,
    });
  });

  it('exposes #subscribe method', () => {
    expect(filterSuggestionsGenerator.subscribe).toBeTruthy();
  });

  describe('#filterSuggestions', () => {
    it('when engine facet state contains a regular facet, generates a filter suggestions controller', () => {
      const facetId = 'regular_facet_id';
      setFacetState([
        {
          facetId,
          field: 'regular_field',
          displayName: 'Facet',
          type: 'regular',
        },
      ]);

      expect(filterSuggestionsGenerator.filterSuggestions.length).toEqual(1);
      expect(filterSuggestionsGenerator.filterSuggestions[0].state).toEqual(
        buildFilterSuggestions(engine, {facetId, ...commonOptions}).state
      );
    });

    it('when engine facet state contains a category facet, generates a category filter suggestions controller', () => {
      const facetId = 'category_facet_id';
      setFacetState([
        {
          facetId,
          field: 'category_field',
          displayName: 'Facet',
          type: 'hierarchical',
        },
      ]);

      expect(filterSuggestionsGenerator.filterSuggestions.length).toEqual(1);
      expect(filterSuggestionsGenerator.filterSuggestions[0].state).toEqual(
        buildCategoryFilterSuggestions(engine, {facetId, ...commonOptions})
          .state
      );
    });

    it('when engine facet state contains multiple facets, generates the proper facet controllers', () => {
      const facets: FieldSuggestionsFacet[] = [
        {
          facetId: 'regular_facet_id',
          field: 'regular_field',
          displayName: 'Regular Facet',
          type: 'regular',
        },
        {
          facetId: 'category_facet_id',
          field: 'category_field',
          displayName: 'Category Facet',
          type: 'hierarchical',
        },
      ];
      setFacetState(facets);

      expect(filterSuggestionsGenerator.filterSuggestions.length).toEqual(2);
      expect(filterSuggestionsGenerator.filterSuggestions[0].state).toEqual(
        buildFilterSuggestions(engine, {
          facetId: facets[0].facetId,
          ...commonOptions,
        }).state
      );
      expect(filterSuggestionsGenerator.filterSuggestions[1].state).toEqual(
        buildCategoryFilterSuggestions(engine, {
          facetId: facets[1].facetId,
          ...commonOptions,
        }).state
      );
    });
  });

  it('#state exposes the field suggestions order', () => {
    expect(filterSuggestionsGenerator.state).toEqual(
      state.fieldSuggestionsOrder
    );

    state.fieldSuggestionsOrder.push({
      facetId: 'new_facet_id',
      field: 'new_facet_field',
      displayName: 'New Facet',
      type: 'regular',
    });

    initFilterSuggestionsGenerator();

    expect(filterSuggestionsGenerator.state).toEqual(
      state.fieldSuggestionsOrder
    );
  });
});
