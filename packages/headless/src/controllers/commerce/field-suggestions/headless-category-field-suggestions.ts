import {createSelector} from '@reduxjs/toolkit';
import {FieldSuggestionsFacet} from '../../../api/commerce/search/query-suggest/query-suggest-response';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../app/state-key';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {
  CategoryFacetSearchSection,
  CommerceFacetSetSection,
  FacetSearchSection,
  FieldSuggestionsOrderSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {
  CategoryFieldSuggestionsState as CoreCategoryFieldSuggestionsState,
  CategoryFieldSuggestionsValue,
} from '../../field-suggestions/category-facet/headless-category-field-suggestions';
import {CategoryFacetOptions} from '../core/facets/category/headless-commerce-category-facet';
import {buildCategoryFacetSearch} from '../core/facets/category/headless-commerce-category-facet-search';
import {FacetControllerType} from '../core/facets/headless-core-commerce-facet';

export type {CategoryFieldSuggestionsValue};

export type CategoryFieldSuggestionsState = CoreCategoryFieldSuggestionsState &
  Pick<FieldSuggestionsFacet, 'facetId' | 'displayName' | 'field'>;

/**
 * The `CategoryFieldSuggestions` controller provides query suggestions based on a particular category facet field.
 *
 * For example, you could use this controller to provide auto-completion suggestions while the end user is typing an item category.
 *
 * This controller is a wrapper around the basic category facet controller search functionality, and thus exposes similar options and properties.
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

export function buildCategoryFieldSuggestions(
  engine: CommerceEngine,
  options: CategoryFacetOptions
): CategoryFieldSuggestions {
  if (!loadFieldSuggestionsReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;

  const facetSearch = buildCategoryFacetSearch(engine, {
    options: {
      facetId: options.facetId,
      ...options.facetSearch,
      numberOfValues: 10,
    },
    select: () => {
      dispatch(options.fetchProductsActionCreator());
    },
    isForFieldSuggestions: true,
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
      state.categoryFacetSearchSet[options.facetId],
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

    updateText: function (text: string) {
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
