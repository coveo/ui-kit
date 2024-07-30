import {FacetSearchType} from '../../../api/commerce/facet-search/facet-search-request';
import {FieldSuggestionsFacet} from '../../../api/commerce/search/query-suggest/query-suggest-response';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {CommerceAppState} from '../../../state/commerce-app-state';
import {buildMockCategoryFacetSearch} from '../../../test/mock-category-facet-search';
import {buildMockCommerceFacetRequest} from '../../../test/mock-commerce-facet-request';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../test/mock-facet-search';
import {buildCategoryFieldSuggestions} from './headless-category-field-suggestions';
import {buildFieldSuggestions} from './headless-field-suggestions';
import {
  buildFieldSuggestionsGenerator,
  FieldSuggestionsGenerator,
} from './headless-field-suggestions-generator';

describe('fieldSuggestionsGenerator', () => {
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let fieldSuggestionsGenerator: FieldSuggestionsGenerator;
  const commonOptions = {
    fetchProductsActionCreator: jest.fn(),
    facetResponseSelector: jest.fn(),
    isFacetLoadingResponseSelector: jest.fn(),
    facetSearch: {type: 'SEARCH' as FacetSearchType},
  };

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initCommerceFacetGenerator() {
    fieldSuggestionsGenerator = buildFieldSuggestionsGenerator(engine);
  }

  function setFacetState(config: FieldSuggestionsFacet[] = []) {
    for (const facet of config) {
      state.fieldSuggestionsOrder.push(facet);
      state.commerceFacetSet[facet.facetId] = {
        request: buildMockCommerceFacetRequest({
          facetId: facet.facetId,
          type: facet.type,
        }),
      };
      state.facetSearchSet[facet.facetId] = buildMockFacetSearch();
      state.categoryFacetSearchSet[facet.facetId] =
        buildMockCategoryFacetSearch();
    }
  }

  beforeEach(() => {
    jest.resetAllMocks();

    state = buildMockCommerceState();
    setFacetState();

    initEngine(state);
    initCommerceFacetGenerator();
  });

  it('initializes', () => {
    expect(fieldSuggestionsGenerator).toBeTruthy();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      fieldSuggestionsOrder,
      commerceFacetSet,
      facetSearchSet,
      categoryFacetSearchSet,
    });
  });

  it('exposes #subscribe method', () => {
    expect(fieldSuggestionsGenerator.subscribe).toBeTruthy();
  });

  describe('#fieldSuggestions', () => {
    it('when engine facet state contains a regular facet, generates a field suggestions controller', () => {
      const facetId = 'regular_facet_id';
      setFacetState([
        {
          facetId,
          field: 'regular_field',
          displayName: 'Facet',
          type: 'regular',
        },
      ]);

      expect(fieldSuggestionsGenerator.fieldSuggestions.length).toEqual(1);
      expect(fieldSuggestionsGenerator.fieldSuggestions[0].state).toEqual(
        buildFieldSuggestions(engine, {facetId, ...commonOptions}).state
      );
    });

    it('when engine facet state contains a category facet, generates a category field suggestions controller', () => {
      const facetId = 'category_facet_id';
      setFacetState([
        {
          facetId,
          field: 'category_field',
          displayName: 'Facet',
          type: 'hierarchical',
        },
      ]);

      expect(fieldSuggestionsGenerator.fieldSuggestions.length).toEqual(1);
      expect(fieldSuggestionsGenerator.fieldSuggestions[0].state).toEqual(
        buildCategoryFieldSuggestions(engine, {facetId, ...commonOptions}).state
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

      expect(fieldSuggestionsGenerator.fieldSuggestions.length).toEqual(2);
      expect(fieldSuggestionsGenerator.fieldSuggestions[0].state).toEqual(
        buildFieldSuggestions(engine, {
          facetId: facets[0].facetId,
          ...commonOptions,
        }).state
      );
      expect(fieldSuggestionsGenerator.fieldSuggestions[1].state).toEqual(
        buildCategoryFieldSuggestions(engine, {
          facetId: facets[1].facetId,
          ...commonOptions,
        }).state
      );
    });
  });

  it('#state exposes the field suggestions order', () => {
    expect(fieldSuggestionsGenerator.state).toEqual(
      state.fieldSuggestionsOrder
    );

    state.fieldSuggestionsOrder.push({
      facetId: 'new_facet_id',
      field: 'new_facet_field',
      displayName: 'New Facet',
      type: 'regular',
    });

    initCommerceFacetGenerator();

    expect(fieldSuggestionsGenerator.state).toEqual(
      state.fieldSuggestionsOrder
    );
  });
});
