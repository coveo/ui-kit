import {FieldSuggestionsFacet} from '../../../api/commerce/search/query-suggest/query-suggest-response';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../app/state-key';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Subscribable,
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
  extends Subscribable,
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

  const getFacetForFieldSuggestions = (facetId: string) => {
    return engine[stateKey].fieldSuggestionsOrder!.find(
      (facet) => facet.facetId === facetId
    )!;
  };

  const controller = buildController(engine);
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
        ...facetSearch.state,
      };
    },

    type: 'hierarchical',
  };
}

function loadFieldSuggestionsReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({commerceFacetSet});
  return true;
}
