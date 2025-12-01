import {createSelector} from '@reduxjs/toolkit';
import type {FieldSuggestionsFacet} from '../../../api/commerce/search/query-suggest/query-suggest-response.js';
import type {
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
import type {
  CategoryFacetSearchSection,
  CommerceFacetSetSection,
  CommerceQuerySection,
  FacetSearchSection,
  FieldSuggestionsOrderSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import type {CategoryFacetSearchResult} from '../../facets/category-facet/headless-category-facet.js';
import type {
  CategoryFieldSuggestionsValue,
  CategoryFieldSuggestionsState as CoreCategoryFieldSuggestionsState,
} from '../../field-suggestions/category-facet/headless-category-field-suggestions.js';
import type {CategoryFacetOptions} from '../core/facets/category/headless-commerce-category-facet.js';
import {buildCategoryFacetSearch} from '../core/facets/category/headless-commerce-category-facet-search.js';
import type {FacetControllerType} from '../core/facets/headless-core-commerce-facet.js';

/**
 * The state of the `CategoryFilterSuggestions` controller.
 *
 * @group Buildable controllers
 * @category CategoryFilterSuggestions
 */
export type CategoryFilterSuggestionsState = CoreCategoryFieldSuggestionsState &
  Pick<FieldSuggestionsFacet, 'facetId' | 'displayName' | 'field'>;

/**
 * The `CategoryFilterSuggestions` controller provides methods to request and interact with category facet suggestions
 * based on a specific field for a given search query.
 *
 * @alpha  This controller relies on a Commerce API functionality that is not yet generally available. If you wish to
 * use this feature in an implementation, please contact your Coveo representative.
 *
 * @group Buildable controllers
 * @category CategoryFilterSuggestions
 */
export interface CategoryFilterSuggestions
  extends Controller,
    FacetControllerType<'hierarchical'> {
  /**
   * Resets the query in the controller state and clears the category filter suggestions.
   */
  clear(): void;

  /**
   * Returns the serialized search parameters for the current search query and specified category filter suggestion.
   *
   * For example, `q=jeans&cf-ec-category=Clothes,Pants`.
   *
   * In a typical scenario, this method should called when the user selects a category filter suggestion from a
   * standalone search box. The returned string is then used to pass the correct URL query parameters or fragment when
   * redirecting the browser to the search page.
   *
   * When the user selects a category filter suggestion from the main search box on the search page, use the `select`
   * method instead.
   *
   * @param value - The category filter suggestion to serialize.
   * @returns The serialized search parameters for the current search query and specified category filter suggestion.
   */
  getSearchParameters(value: CategoryFieldSuggestionsValue): string;

  /**
   * Clears all facet values, selects the specified category filter suggestion, updates the query, and executes a new
   * search request.
   *
   * In a typical scenario, this method should be called when the user selects a category filter suggestion from the
   * main search box on the search page.
   *
   * When the user selects a category filter suggestion from a standalone search box, use the `getSearchParameters`
   * method instead.
   *
   * @param value - The category filter suggestion to select.
   */
  select(value: CategoryFieldSuggestionsValue): void;

  /**
   * Sets the query in the controller state to the specified value and requests category filter suggestions based on the
   * updated query.
   *
   * For example, if this method is called with `jeans` as an argument, it will request values from the controller's
   * field (for example, `ec_category`) that would return results if selected when the search query is `jeans` (such as
   * `Clothing`, `Clothing;Pants`, and `Clothing;Shorts`).
   *
   * @param query - The search query to use as context to request the category filter suggestions. In a typical
   * scenario, this should set to the current value of the search box input.
   */
  updateQuery(query: string): void;

  state: CategoryFilterSuggestionsState;
}

/**
 * The `CategoryFilterSuggestions` controller provides methods to request and interact with category facet suggestions
 * based on a specific field for a given search query.
 *
 * @alpha  This controller relies on a Commerce API functionality that is not yet generally available. If you wish to
 * use this feature in an implementation, please contact your Coveo representative.
 *
 * @param engine - The headless commerce engine.
 * @param options - The options for the `CategoryFilterSuggestions` controller.
 * @returns A `CategoryFilterSuggestions` controller instance.
 *
 * @group Buildable controllers
 * @category CategoryFilterSuggestions
 */
export function buildCategoryFilterSuggestions(
  engine: CommerceEngine,
  options: CategoryFacetOptions
): CategoryFilterSuggestions {
  if (!loadCategoryFilterSuggestionsReducers(engine)) {
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

    updateQuery: (text: string) => {
      facetSearch.updateText(text);
      facetSearch.search();
    },

    getSearchParameters: (value: CategoryFacetSearchResult) =>
      searchSerializer.serialize({
        q: facetSearchStateSelector(getState()).query,
        cf: {[options.facetId]: [...value.path, value.rawValue]},
      }),

    select: (value: CategoryFacetSearchResult) => {
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

    get state() {
      const {displayName, field, facetId} = facetForFieldSuggestionsSelector(
        getState()
      );
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

function loadCategoryFilterSuggestionsReducers(
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
