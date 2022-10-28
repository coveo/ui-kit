import {SearchEngine} from '../../../app/search-engine/search-engine';
import {buildFacetSearch} from '../../core/facets/facet-search/specific/headless-facet-search';
import {
  buildController,
  Subscribable,
} from '../../controller/headless-controller';
import {loadReducerError} from '../../../utils/errors';
import {CoreEngine} from '../../../app/engine';
import {
  facetSet,
  configuration,
  facetSearchSet,
  search,
} from '../../../app/reducers';
import {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments';
import {
  FacetSection,
  ConfigurationSection,
  FacetSearchSection,
  SearchSection,
} from '../../../state/state-sections';
import {determineFacetId} from '../../core/facets/_common/facet-id-determinor';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {executeSearch} from '../../../features/search/search-actions';
import {logFacetSelect} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {defaultFacetOptions} from '../../../features/facets/facet-set/facet-set-slice';
import {omit} from '../../../utils/utils';
import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions';
import {FacetSortCriterion} from '../../../features/facets/facet-set/interfaces/request';

export interface FieldSuggestionsValue {
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
}

export interface FieldSuggestionsState {
  /**
   * The field suggestions.
   */
  values: FieldSuggestionsValue[];

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
   * @param value - The field suggestion for which to select the matching facet value.
   */
  select(value: FieldSuggestionsValue): void;

  /**
   * Filters the search using the specified value, deselecting others.
   *
   * If a facet exists with the configured `facetId`, selects the corresponding facet value while deselecting other facet values.
   *
   * @param value - The field suggestion for which to select the matching facet value.
   */
  singleSelect(value: FieldSuggestionsValue): void;

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

  state: FieldSuggestionsState;
}

// TODO: In v2, move these options into `FieldSuggestionsOptions` and remove `facetSearch`.
export interface FieldSuggestionsFacetSearchOptions {
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

export interface FieldSuggestionsOptions {
  /**
   * The field for which you wish to get field suggestions.
   */
  field: string;

  /**
   * @deprecated This option has no effect.
   */
  delimitingCharacter?: string;

  /**
   * A unique identifier for the controller. By default, a random unique identifier is generated.
   *
   * If a facet shares the same id, then its values are going to be selectable with `select` and `singleSelect`.
   */
  facetId?: string;

  /**
   * The options related to search.
   */
  facetSearch?: FieldSuggestionsFacetSearchOptions;

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
  sortCriteria?: FacetSortCriterion;

  /**
   * @deprecated This option has no effect.
   */
  allowedValues?: string[];

  /**
   * @deprecated This option has no effect.
   */
  hasBreadcrumbs?: boolean;
}

export interface FieldSuggestionsProps {
  /**
   * The options for the `FieldSuggestions` controller.
   */
  options: FieldSuggestionsOptions;
}

/**
 * Creates a `FieldSuggestions` controller instance.
 * @param engine The headless engine.
 * @param props The configurable `FieldSuggestions` controller properties.
 * @returns A `FieldSuggestions` controller instance.
 */
export function buildFieldSuggestions(
  engine: SearchEngine,
  props: FieldSuggestionsProps
): FieldSuggestions {
  if (!loadFieldSuggestionsReducers(engine)) {
    throw loadReducerError;
  }
  const facetId = determineFacetId(engine, props.options);
  engine.dispatch(
    registerFacet({
      ...defaultFacetOptions,
      ...omit('facetSearch', props.options),
      field: props.options.field,
      facetId,
    })
  );

  const facetSearch = buildFacetSearch(engine, {
    options: {...props.options.facetSearch, facetId},
    select: (value) => {
      engine.dispatch(updateFacetOptions({freezeFacetOrder: true}));
      engine.dispatch(
        executeSearch(logFacetSelect({facetId, facetValue: value.rawValue}))
      );
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
  engine: CoreEngine
): engine is CoreEngine<
  FacetSection & ConfigurationSection & FacetSearchSection & SearchSection,
  SearchThunkExtraArguments
> {
  engine.addReducers({facetSet, configuration, facetSearchSet, search});
  return true;
}
