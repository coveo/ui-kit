import {configuration} from '../../../app/common-reducers.js';
import type {CoreEngine} from '../../../app/engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import type {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments.js';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions.js';
import {
  executeFacetSearch,
  executeFieldSuggest,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions.js';
import {
  facetExclude,
  facetSelect,
  logFacetExclude,
  logFacetSelect,
} from '../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {
  defaultFacetOptions,
  facetSetReducer as facetSet,
} from '../../../features/facets/facet-set/facet-set-slice.js';
import {executeSearch} from '../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {
  ConfigurationSection,
  FacetSearchSection,
  FacetSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Subscribable,
} from '../../controller/headless-controller.js';
import {determineFacetId} from '../../core/facets/_common/facet-id-determinor.js';
import {buildFacetSearch} from '../../core/facets/facet-search/specific/headless-facet-search.js';
import type {FacetOptions} from '../../facets/facet/headless-facet-options.js';

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

/**
 * The state of the `FieldSuggestions` controller.
 *
 * @group Controllers
 * @category FieldSuggestions
 */
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
 *
 * Example: [field-suggestions.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/field-suggestions/specific-field/field-suggestions.fn.tsx)
 *
 * @group Controllers
 * @category FieldSuggestions
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

export interface FieldSuggestionsOptions {
  /**
   * The options used to register the facet used by the field suggestions controller.
   */
  facet: FacetOptions;
}

export interface FieldSuggestionsProps {
  /**
   * The options for the `FieldSuggestions` controller.
   */
  options: FieldSuggestionsOptions;
}

/**
 * Creates a `FieldSuggestions` controller instance.
 *
 * This controller initializes a facet under the hood, but exposes state and methods that are relevant for suggesting field values based on a query.
 * It's important not to initialize a facet with the same `facetId` but different options, because only the options of the controller which is built first will be taken into account.
 *
 * @param engine The headless engine.
 * @param props The configurable `FieldSuggestions` controller properties.
 * @returns A `FieldSuggestions` controller instance.
 *
 * @group Controllers
 * @category FieldSuggestions
 */
export function buildFieldSuggestions(
  engine: SearchEngine,
  props: FieldSuggestionsProps
): FieldSuggestions {
  if (!loadFieldSuggestionsReducers(engine)) {
    throw loadReducerError;
  }
  const {
    facetSearch: facetSearchOptions,
    allowedValues,
    ...facetOptions
  } = props.options.facet;
  const facetId = determineFacetId(engine, facetOptions);
  engine.dispatch(
    registerFacet({
      ...defaultFacetOptions,
      ...facetOptions,
      facetId,
      ...(allowedValues && {
        allowedValues: {
          type: 'simple',
          values: allowedValues,
        },
      }),
    })
  );

  const facetSearch = buildFacetSearch(engine, {
    options: {...facetSearchOptions, facetId},
    select: (value) => {
      engine.dispatch(updateFacetOptions());
      engine.dispatch(
        executeSearch({
          legacy: logFacetSelect({facetId, facetValue: value.rawValue}),
          next: facetSelect(),
        })
      );
    },
    exclude: (value) => {
      engine.dispatch(updateFacetOptions());
      engine.dispatch(
        executeSearch({
          legacy: logFacetExclude({facetId, facetValue: value.rawValue}),
          next: facetExclude(),
        })
      );
    },
    isForFieldSuggestions: true,
    executeFacetSearchActionCreator: executeFacetSearch,
    executeFieldSuggestActionCreator: executeFieldSuggest,
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

function loadFieldSuggestionsReducers(
  engine: CoreEngine
): engine is CoreEngine<
  FacetSection & ConfigurationSection & FacetSearchSection & SearchSection,
  SearchThunkExtraArguments
> {
  engine.addReducers({facetSet, configuration, facetSearchSet, search});
  return true;
}
