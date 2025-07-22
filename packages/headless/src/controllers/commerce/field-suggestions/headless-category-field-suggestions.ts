import {createSelector} from '@reduxjs/toolkit';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {getFacetIdWithCommerceFieldSuggestionNamespace} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice.js';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice.js';
import type {FieldSuggestionsFacet} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-state.js';
import {selectCategoryFacetSearchResult} from '../../../features/facets/facet-search-set/category/category-facet-search-actions.js';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice.js';
import type {
  CategoryFacetSearchSection,
  CommerceFacetSetSection,
  FacetSearchSection,
  FieldSuggestionsOrderSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import type {
  CategoryFieldSuggestionsValue,
  CategoryFieldSuggestionsState as CoreCategoryFieldSuggestionsState,
} from '../../field-suggestions/category-facet/headless-category-field-suggestions.js';
import type {CategoryFacetOptions} from '../core/facets/category/headless-commerce-category-facet.js';
import {buildCategoryFacetSearch} from '../core/facets/category/headless-commerce-category-facet-search.js';
import type {FacetControllerType} from '../core/facets/headless-core-commerce-facet.js';

/**
 * The state of the `CategoryFieldSuggestions` controller.
 *
 * @group Buildable controllers
 * @category CategoryFieldSuggestions
 * @alpha
 * @deprecated
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
 * @alpha
 * @deprecated
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
   * Requests field suggestions based on a query.
   */
  search(): void;

  /**
   * Filters the search using the specified value.
   *
   * If a facet exists with the configured `facetId`, selects the corresponding facet value.
   *
   * @param value - The field suggestion to select.
   */
  select(value: CategoryFieldSuggestionsValue): void;

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
  if (!loadFieldSuggestionsReducers(engine)) {
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
      numberOfValues: 10,
    },
    select: () => {
      dispatch(options.fetchProductsActionCreator());
    },
    isForFieldSuggestions: false,
  });

  const getState = () => engine[stateKey];

  const getFacetForFieldSuggestions = (facetId: string) => {
    return getState().fieldSuggestionsOrder.find(
      (facet) => facet.facetId === facetId
    )!;
  };

  const controller = buildController(engine);

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

  return {
    ...controller,
    ...facetSearch,

    select: (value: CategoryFieldSuggestionsValue) => {
      dispatch(
        selectCategoryFacetSearchResult({facetId: options.facetId, value})
      );

      dispatch(options.fetchProductsActionCreator());
    },

    updateText: (text: string) => {
      facetSearch.updateText(text);
      facetSearch.search();
    },

    get state() {
      const facet = getFacetForFieldSuggestions(options.facetId);
      return {
        displayName: facet.displayName,
        field: facet.field,
        facetId: facet.facetId,
        ...facetSearchStateSelector(getState()),
      };
    },

    type: 'hierarchical',
  };
}

function loadFieldSuggestionsReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  FieldSuggestionsOrderSection &
    CommerceFacetSetSection &
    CategoryFacetSearchSection &
    FacetSearchSection
> {
  engine.addReducers({
    fieldSuggestionsOrder,
    categoryFacetSearchSet,
    commerceFacetSet,
  });
  return true;
}
