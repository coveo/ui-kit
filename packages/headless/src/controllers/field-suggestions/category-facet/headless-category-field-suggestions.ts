import {
  buildController,
  Subscribable,
} from '../../controller/headless-controller';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {CoreEngine} from '../../..';
import {
  categoryFacetSet,
  configuration,
  categoryFacetSearchSet,
  search,
} from '../../../app/reducers';
import {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments';
import {registerCategoryFacet} from '../../../features/facets/category-facet-set/category-facet-set-actions';
import {defaultCategoryFacetOptions} from '../../../features/facets/category-facet-set/category-facet-set-slice';
import {CategoryFacetSortCriterion} from '../../../features/facets/category-facet-set/interfaces/request';
import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {omit} from '../../../utils/utils';
import {buildCategoryFacetSearch} from '../../facets/category-facet/headless-category-facet-search';
import {determineFacetId} from '../../core/facets/_common/facet-id-determinor';

export interface CategoryFieldSuggestionsValue {
  /**
   * The custom field suggestion display name, as specified in the `captions` argument of the `FieldSuggestion` controller.
   */
  displayValue: string;
  /**
   * The original field value, as retrieved from the field in the index.
   */
  rawValue: string;
  /**
   * An estimated number of result items matching both the current query and
   * the filter expression that would get generated if this field suggestion was selected.
   */
  count: number;
  /**
   * The hierarchical path to the value.
   */
  path: string[];
}

export interface CategoryFieldSuggestionsState {
  /**
   * The field suggestions.
   */
  values: CategoryFieldSuggestionsValue[];

  /**
   * Whether the request for field suggestions is in progress.
   */
  isLoading: boolean;

  /**
   * Whether more field suggestions are available.
   */
  moreValuesAvailable: boolean;

  /**
   * The query used to request field suggestions.
   */
  query: string;
}

/**
 * The `CategoryFieldSuggestions` controller provides query suggestions based on a particular category facet field.
 *
 * For example, you could use this controller to provide auto-completion suggestions while the end user is typing an item category.
 *
 * This controller is a wrapper around the basic category facet controller search functionality, and thus exposes similar options and properties.
 */
export interface CategoryFieldSuggestions extends Subscribable {
  /**
   * Requests field suggestions based on a query.
   *
   * @param text - The query to search.
   */
  updateText(text: string): void;

  /**
   * Shows more field suggestions for the current query.
   */
  showMoreResults(): void;

  /**
   * Requests field suggestions based on a query.
   */
  search(): void;

  /**
   * If a facet exists with the configured `facetId`, selects a facet value.
   *
   * @param value - The field suggestion for which to select the matching facet value.
   */
  select(value: CategoryFieldSuggestionsValue): void;

  /**
   * Resets the query and empties the suggestions.
   */
  clear(): void;

  /**
   * Updates the captions of field suggestions.
   *
   * @param captions - A dictionary that maps field values to field suggestion display names.
   */
  updateCaptions(captions: Record<string, string>): void;

  state: CategoryFieldSuggestionsState;
}

// TODO: In v2, move these options into `FieldSuggestionsOptions` and remove `facetSearch`.
export interface CategoryFieldSuggestionsFacetSearchOptions {
  /**
   * A dictionary that maps field values to field suggestion display names.
   */
  captions?: Record<string, string>;

  /**
   * The maximum number of suggestions to request.
   *
   * @defaultValue `10`
   */
  numberOfValues?: number;

  /**
   * The query with which to request field suggestions.
   */
  query?: string;
}

export interface CategoryFieldSuggestionsOptions {
  /**
   * The field for which you wish to get field suggestions.
   */
  field: string;

  /**
   * The base path shared by all values for the field suggestions.
   *
   * @defaultValue `[]`
   */
  basePath?: string[];

  /**
   * The character that specifies the hierarchical dependency.
   *
   * @defaultValue `;`
   */
  delimitingCharacter?: string;

  /**
   * A unique identifier for the controller. By default, a random unique identifier is generated.
   *
   * If a facet shares the same id, then its values are going to be selectable with `select` and `singleSelect`. However, you must make sure to build the field suggestion controller after the facet controller.
   */
  facetId?: string;

  /**
   * The options related to search.
   */
  facetSearch?: CategoryFieldSuggestionsFacetSearchOptions;

  /**
   * Whether to filter the results using `basePath`.
   *
   * @defaultValue `true`
   */
  filterByBasePath?: boolean;

  /**
   * Whether to exclude the parents of folded results when estimating the result count for each field suggestion.
   *
   * @defaultValue `true`
   */
  filterFacetCount?: boolean;

  /**
   * @deprecated This option has no effect.
   */
  injectionDepth?: number;

  /**
   * This option has no effect.
   */
  numberOfValues?: number;

  /**
   * The criterion to use to sort returned field suggestions.
   * Learn more about `sortCriteria` values and the default behavior of specific facets in the [Search API documentation](https://docs.coveo.com/en/1461/#RestFacetRequest-sortCriteria).
   *
   * @defaultValue `automatic`
   */
  sortCriteria?: CategoryFacetSortCriterion;
}

export interface CategoryFieldSuggestionsProps {
  /**
   * The options for the `CategoryFieldSuggestions` controller.
   */
  options: CategoryFieldSuggestionsOptions;
}

/**
 * Creates a `CategoryFieldSuggestions` controller instance.
 * @param engine The headless engine.
 * @param props The configurable `CategoryFieldSuggestions` controller properties.
 * @returns A `CategoryFieldSuggestions` controller instance.
 */
export function buildCategoryFieldSuggestions(
  engine: SearchEngine,
  props: CategoryFieldSuggestionsProps
): CategoryFieldSuggestions {
  if (!loadCategoryFieldSuggestionsReducers(engine)) {
    throw loadReducerError;
  }
  const facetId = determineFacetId(engine, props.options);
  engine.dispatch(
    registerCategoryFacet({
      ...defaultCategoryFacetOptions,
      ...omit('facetSearch', props.options),
      field: props.options.field,
      facetId,
    })
  );

  const facetSearch = buildCategoryFacetSearch(engine, {
    options: {...props.options.facetSearch, facetId},
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

function loadCategoryFieldSuggestionsReducers(
  engine: CoreEngine
): engine is CoreEngine<
  CategoryFacetSection &
    ConfigurationSection &
    CategoryFacetSearchSection &
    SearchSection,
  SearchThunkExtraArguments
> {
  engine.addReducers({
    categoryFacetSet,
    configuration,
    categoryFacetSearchSet,
    search,
  });
  return true;
}
