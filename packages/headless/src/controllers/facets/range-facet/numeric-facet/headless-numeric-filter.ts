import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {
  ConfigurationSection,
  NumericFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {configuration, numericFacetSet, search} from '../../../../app/reducers';
import {baseFacetResponseSelector} from '../../../../features/facets/facet-set/facet-set-selectors';
import {determineFacetId} from '../../_common/facet-id-determinor';
import {
  NumericFacetResponse,
  NumericFacetValue,
} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {deselectAllFacetValues} from '../../../../features/facets/facet-set/facet-set-actions';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';
import {executeSearch} from '../../../../features/search/search-actions';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions';
import {
  registerNumericFacet,
  RegisterNumericFacetActionCreatorPayload,
  updateNumericFacetValues,
} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {validateNumericFacetOptions} from './headless-numeric-facet-options';

/**
 * The options defining a `NumericFilter`.
 */
export interface NumericFilterOptions {
  /**
   * The field whose values you want to display in the filter.
   */
  field: string;

  /**
   * A unique identifier for the controller.
   * By default, a unique random ID is generated.
   */
  facetId?: string;

  /**
   * Whether to exclude folded result parents when estimating the result count for each facet value.
   *
   * @defaultValue `true`
   */
  filterFacetCount?: boolean;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   *
   * Note: A high injectionDepth may negatively impact the facet request performance.
   *
   * Minimum: `0`
   *
   * @defaultValue `1000`
   */
  injectionDepth?: number;
}

export interface NumericFilterRange {
  /**
   * The starting value for the numeric range.
   */
  start: number;

  /**
   * The ending value for the numeric range.
   */
  end: number;
}

export interface NumericFilterProps {
  /**
   * The options for the `NumericFilter` controller.
   */
  options: NumericFilterOptions;
  /**
   * The initial range that should be applied to the `NumericFilter` controller.
   */
  initialState?: NumericFilterRange;
}

export interface NumericFilterState {
  /**
   * The facet ID.
   * */
  facetId: string;

  /**
   * The current selected range.
   */
  range?: NumericFacetValue;

  /**
   * Returns `true` if a search is in progress, and `false` if not.
   */
  isLoading: boolean;
}

/**
 * The `NumericFilter` controller makes it possible to create a numeric filter.
 */
export interface NumericFilter extends Controller {
  /**
   * Deselects current filter.
   */
  deselect(): void;

  /**
   * Updates the selected range.
   *
   * @param range - The numeric range.
   */
  setRange(range: NumericFilterRange): void;

  /**
   * The state of the `NumericFacet` controller.
   */
  state: NumericFilterState;
}

export function buildNumericFilter(
  engine: SearchEngine,
  props: NumericFilterProps
): NumericFilter {
  if (!loadNumericFilterReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const facetId = determineFacetId(engine, props.options);
  const options: RegisterNumericFacetActionCreatorPayload = {
    ...props.options,
    currentValues: props.initialState
      ? [{...props.initialState, endInclusive: true, state: 'selected'}]
      : [],
    generateAutomaticRanges: false,
    facetId,
  };

  validateNumericFacetOptions(engine, options);
  dispatch(registerNumericFacet(options));

  return {
    ...controller,
    deselect: () => {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetClearAll(facetId)));
    },
    setRange: (range) => {
      const facetValue: NumericFacetValue = {
        ...range,
        state: 'selected',
        numberOfResults: 0,
        endInclusive: true,
      };

      dispatch(
        updateNumericFacetValues({
          facetId,
          values: [facetValue],
        })
      );
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(
        executeSearch(
          logFacetSelect({
            facetId,
            facetValue: `${facetValue.start}..${facetValue.end}`,
          })
        )
      );
    },

    get state() {
      const isLoading = engine.state.search.isLoading;
      const response = baseFacetResponseSelector(engine.state, facetId) as
        | NumericFacetResponse
        | undefined;
      const range = response?.values.length ? response.values[0] : undefined;

      return {
        facetId,
        isLoading,
        range,
      };
    },
  };
}

function loadNumericFilterReducer(
  engine: SearchEngine
): engine is SearchEngine<
  NumericFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({numericFacetSet, configuration, search});
  return true;
}
