import {createSelector} from '@reduxjs/toolkit';
import {FieldSuggestionsFacet} from '../../../api/commerce/search/query-suggest/query-suggest-response.js';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {clearAllCoreFacets} from '../../../features/commerce/facets/core-facet/core-facet-actions.js';
import {getFacetIdWithCommerceFieldSuggestionNamespace} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice.js';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice.js';
import {searchSerializer} from '../../../features/commerce/parameters/parameters-serializer.js';
import {updateQuery} from '../../../features/commerce/query/query-actions.js';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice.js';
import {selectCategoryFacetSearchResult} from '../../../features/facets/facet-search-set/category/category-facet-search-actions.js';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice.js';
import {
  CategoryFacetSearchSection,
  CommerceFacetSetSection,
  CommerceQuerySection,
  FacetSearchSection,
  FieldSuggestionsOrderSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller.js';
import {CategoryFacetSearchResult} from '../../facets/category-facet/headless-category-facet.js';
import {
  CategoryFieldSuggestionsState as CoreCategoryFieldSuggestionsState,
  CategoryFieldSuggestionsValue,
} from '../../field-suggestions/category-facet/headless-category-field-suggestions.js';
import {buildCategoryFacetSearch} from '../core/facets/category/headless-commerce-category-facet-search.js';
import {CategoryFacetOptions} from '../core/facets/category/headless-commerce-category-facet.js';
import {FacetControllerType} from '../core/facets/headless-core-commerce-facet.js';

export type {CategoryFieldSuggestionsValue};

/**
 * The state of the `CategoryFieldSuggestions` controller.
 *
 * @group Buildable controllers
 * @category CategoryFieldSuggestions
 */
export type CategoryFieldSuggestionsState = CoreCategoryFieldSuggestionsState &
  Pick<FieldSuggestionsFacet, 'facetId' | 'displayName' | 'field'>;

/**
 * The `CategoryFieldSuggestions` controller provides query suggestions based on a particular category facet field.
 *
 * For example, you could use this controller to provide auto-completion suggestions while the end user is typing an item category.
 *
 * This controller is a wrapper around the basic category facet controller search functionality, and thus exposes similar options and properties.
 *
 * @group Buildable controllers
 * @category CategoryFieldSuggestions
 */
export interface CategoryFieldSuggestions
  extends Controller,
    FacetControllerType<'hierarchical'> {
  /**
   * Requests field suggestions based on a query.
   *
   * @param text - The query with which to request field suggestions.
   */
  updateText(text: string): void;

  /**
   * Filters the search using the specified value.
   *
   * If a facet exists with the configured `facetId`, selects the corresponding facet value.
   *
   * @param value - The field suggestion to select.
   */
  select(value: CategoryFieldSuggestionsValue): void;

  /**
   * Returns a serialized query for the specified value.
   *
   * @param value - The field suggestion for which to select the matching facet value.
   * @returns A serialized query for the specified value.
   */
  getRedirectionParameters(value: CategoryFacetSearchResult): string;

  /**
   * Resets the query and empties the suggestions.
   */
  clear(): void;

  state: CategoryFieldSuggestionsState;
}

/**
 * The `CategoryFieldSuggestions` controller provides query suggestions based on a particular category facet field.
 * @param engine - The headless commerce engine.
 * @param options - The options for the `CategoryFieldSuggestions` controller.
 * @returns A `CategoryFieldSuggestions` controller instance.
 *
 * @group Buildable controllers
 * @category CategoryFieldSuggestions
 */
export function buildCategoryFieldSuggestions(
  engine: CommerceEngine,
  options: CategoryFacetOptions
): CategoryFieldSuggestions {
  if (!loadCategoryFieldSuggestionsReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;

  const namespacedFacetId = getFacetIdWithCommerceFieldSuggestionNamespace(
    options.facetId
  );
  const facetSearch = buildCategoryFacetSearch(engine, {
    options: {
      facetId: namespacedFacetId,
      ...options.facetSearch,
    },
    select: () => {},
    isForFieldSuggestions: true,
  });

  const getState = () => engine[stateKey];

  const controller = buildController(engine);

  const facetForFieldSuggestionsSelector = createSelector(
    (state: CommerceEngineState) => state.fieldSuggestionsOrder,
    (facets) => facets.find((facet) => facet.facetId === options.facetId)!
  );

  const facetSearchStateSelector = createSelector(
    (state: CommerceEngineState) =>
      state.categoryFacetSearchSet[namespacedFacetId],
    (facetSearch) => ({
      isLoading: facetSearch.isLoading,
      moreValuesAvailable: facetSearch.response.moreValuesAvailable,
      query: facetSearch.options.query,
      values: facetSearch.response.values,
    })
  );

  const {clear} = facetSearch;

  return {
    ...controller,

    clear,

    getRedirectionParameters: function (value: CategoryFacetSearchResult) {
      return searchSerializer.serialize({
        q: facetSearchStateSelector(getState()).query,
        cf: {[options.facetId]: [...value.path, value.rawValue]},
      });
    },

    select: function (value: CategoryFacetSearchResult) {
      dispatch(clearAllCoreFacets());
      dispatch(
        selectCategoryFacetSearchResult({facetId: options.facetId, value})
      );
      dispatch(
        updateQuery({
          query:
            engine[stateKey].categoryFacetSearchSet[namespacedFacetId].options
              .query,
        })
      );
      dispatch(options.fetchProductsActionCreator());
    },

    updateText: function (text: string) {
      facetSearch.updateText(text);
      facetSearch.search();
    },

    get state() {
      const {displayName, field, facetId} =
        facetForFieldSuggestionsSelector(getState());
      return {
        displayName,
        field,
        facetId,
        ...facetSearchStateSelector(getState()),
      };
    },

    type: 'hierarchical',
  };
}

function loadCategoryFieldSuggestionsReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  CategoryFacetSearchSection &
    CommerceFacetSetSection &
    CommerceQuerySection &
    FacetSearchSection &
    FieldSuggestionsOrderSection
> {
  engine.addReducers({
    categoryFacetSearchSet,
    commerceFacetSet,
    commerceQuery,
    fieldSuggestionsOrder,
  });
  return true;
}
