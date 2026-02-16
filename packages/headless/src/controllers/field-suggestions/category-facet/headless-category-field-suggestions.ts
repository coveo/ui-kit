import type {CategoryFacetSearchResult} from '../../../api/search/facet-search/category-facet-search/category-facet-search-response.js';
import {configuration} from '../../../app/common-reducers.js';
import type {CoreEngine} from '../../../app/engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments.js';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions.js';
import {registerCategoryFacet} from '../../../features/facets/category-facet-set/category-facet-set-actions.js';
import {
  categoryFacetSetReducer as categoryFacetSet,
  defaultCategoryFacetOptions,
} from '../../../features/facets/category-facet-set/category-facet-set-slice.js';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice.js';
import {
  executeFacetSearch,
  executeFieldSuggest,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions.js';
import {
  facetSelect,
  logFacetSelect,
} from '../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {executeSearch} from '../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Subscribable,
} from '../../controller/headless-controller.js';
import {determineFacetId} from '../../core/facets/_common/facet-id-determinor.js';
import type {CategoryFacetOptions} from '../../facets/category-facet/headless-category-facet.js';
import {buildCategoryFacetSearch} from '../../facets/category-facet/headless-category-facet-search.js';

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
   *
   * @example
   * ["Electronics", "Smartphones", "Android phones"]
   */
  path: string[];
}

/**
 * The state of the `CategoryFieldSuggestions` controller.
 *
 * @group Controllers
 * @category CategoryFieldSuggestions
 */
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
 *
 * Example: [category-suggestions.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/field-suggestions/category-field/category-suggestions.fn.tsx)
 *
 * @group Controllers
 * @category CategoryFieldSuggestions
 */
export interface CategoryFieldSuggestions extends Subscribable {
  /**
   * Requests field suggestions based on a query.
   *
   * @param text - The query with which to request field suggestions.
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

  /**
   * Updates the captions of field suggestions.
   *
   * @param captions - A dictionary that maps field values to field suggestion display names.
   */
  updateCaptions(captions: Record<string, string>): void;

  state: CategoryFieldSuggestionsState;
}

export interface CategoryFieldSuggestionsOptions {
  /**
   * The options used to register the category facet used under the hood by the field suggestions controller.
   */
  facet: CategoryFacetOptions;
}

export interface CategoryFieldSuggestionsProps {
  /**
   * The options for the `CategoryFieldSuggestions` controller.
   */
  options: CategoryFieldSuggestionsOptions;
}

/**
 * Creates a `CategoryFieldSuggestions` controller instance.
 *
 * This controller initializes a category facet under the hood, but exposes state and methods that are relevant for suggesting field values based on a query.
 * It's important not to initialize a category facet with the same `facetId` but different options, because only the options of the controller which is built first will be taken into account.
 *
 * @param engine The headless engine.
 * @param props The configurable `CategoryFieldSuggestions` controller properties.
 * @returns A `CategoryFieldSuggestions` controller instance.
 *
 * @group Controllers
 * @category CategoryFieldSuggestions
 */
export function buildCategoryFieldSuggestions(
  engine: SearchEngine,
  props: CategoryFieldSuggestionsProps
): CategoryFieldSuggestions {
  if (!loadCategoryFieldSuggestionsReducers(engine)) {
    throw loadReducerError;
  }
  const {facetSearch: facetSearchOptions, ...facetOptions} =
    props.options.facet;
  const facetId = determineFacetId(engine, facetOptions);
  engine.dispatch(
    registerCategoryFacet({
      ...defaultCategoryFacetOptions,
      ...facetOptions,
      facetId,
    })
  );

  const facetSearch = buildCategoryFacetSearch(engine, {
    options: {...facetSearchOptions, facetId},
    executeFacetSearchActionCreator: executeFacetSearch,
    executeFieldSuggestActionCreator: executeFieldSuggest,
    select: (value: CategoryFacetSearchResult) => {
      engine.dispatch(updateFacetOptions());
      engine.dispatch(
        executeSearch({
          legacy: logFacetSelect({facetId, facetValue: value.rawValue}),
          next: facetSelect(),
        })
      );
    },
    isForFieldSuggestions: true,
  });
  const controller = buildController(engine);
  return {
    ...controller,
    ...facetSearch,
    updateText: (text: string) => {
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
