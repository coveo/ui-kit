import {SpecificFacetSearchResult} from '../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Subscribable,
} from '../../controller/headless-controller';
import {RegularFacetOptions} from '../core/facets/regular/headless-commerce-regular-facet';
import {
  buildRegularFacetSearch,
  RegularFacetSearchState,
} from '../core/facets/regular/headless-commerce-regular-facet-search';

export type {SpecificFacetSearchResult};

/**
 * The `FieldSuggestions` controller provides query suggestions based on a particular facet field.
 *
 * For example, you could use this controller to provide auto-completion suggestions while the end user is typing an item title.
 *
 * This controller is a wrapper around the basic facet controller search functionality, and thus exposes similar options and properties.
 */
export interface FieldSuggestions extends Subscribable {
  /**
   * Requests field suggestions based on a query.
   *
   * @param text - The query to search.
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
   * @param value - The field suggestion for which to select the matching facet value.
   */
  select(value: SpecificFacetSearchResult): void;

  /**
   * Filters the search using the specified value, deselecting others.
   *
   * If a facet exists with the configured `facetId`, selects the corresponding facet value while deselecting other facet values.
   *
   * @param value - The field suggestion for which to select the matching facet value.
   */
  singleSelect(value: SpecificFacetSearchResult): void;

  /**
   * Resets the query and empties the suggestions.
   */
  clear(): void;

  state: RegularFacetSearchState;
}

/**
 * Creates a `FieldSuggestions` controller instance.
 *
 * This controller initializes a facet under the hood, but exposes state and methods that are relevant for suggesting field values based on a query.
 * It's important not to initialize a facet with the same `facetId` but different options, because only the options of the controller which is built first will be taken into account.
 *
 * @param engine The headless engine.
 * @param options The `FieldSuggestions` options used internally.
 * @returns A `FieldSuggestions` controller instance.
 */
export function buildFieldSuggestions(
  engine: CommerceEngine,
  options: RegularFacetOptions
): FieldSuggestions {
  if (!loadFieldSuggestionsReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;

  const facetSearch = buildRegularFacetSearch(engine, {
    options: {facetId: options.facetId, ...options.facetSearch},
    select: () => {
      dispatch(options.fetchProductsActionCreator());
    },
    exclude: () => {
      dispatch(options.fetchProductsActionCreator());
    },
    isForFieldSuggestions: true,
  });
  const controller = buildController(engine);
  return {
    ...controller,
    ...facetSearch,
    updateText: function (text: string) {
      facetSearch.updateText(text);
      facetSearch.search();
    },
    get state() {
      return facetSearch.state;
    },
  };
}

function loadFieldSuggestionsReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({commerceFacetSet});
  return true;
}
