import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {
  ConfigurationSection,
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {configuration, dateFacetSet, search} from '../../../../app/reducers';
import {baseFacetResponseSelector} from '../../../../features/facets/facet-set/facet-set-selectors';
import {determineFacetId} from '../../_common/facet-id-determinor';
import {
  DateFacetResponse,
  DateFacetValue,
} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {deselectAllFacetValues} from '../../../../features/facets/facet-set/facet-set-actions';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';
import {executeSearch} from '../../../../features/search/search-actions';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions';
import {
  registerDateFacet,
  RegisterDateFacetActionCreatorPayload,
  updateDateFacetValues,
} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {validateDateFacetOptions} from './headless-date-facet-options';

/**
 * The options defining a `DateFilter`.
 */
export interface DateFilterOptions {
  /**
   * The field whose values you want to display in the filter.
   */
  field: string;

  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
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

export interface DateFilterRange {
  /**
   * The starting value for the date range.
   */
  start: string;

  /**
   * The ending value for the date range.
   */
  end: string;
}

export interface DateFilterProps {
  /**
   * The options for the `DateFilter` controller.
   */
  options: DateFilterOptions;
  /**
   * The initial range that should be applied to the `DateFilter` controller.
   */
  initialState?: DateFilterRange;
}

export interface DateFilterState {
  /**
   * The facet ID.
   * */
  facetId: string;

  /**
   * The current selected range.
   */
  range?: DateFacetValue;

  /**
   * `true` if a search is in progress and `false` otherwise.
   */
  isLoading: boolean;
}

/**
 * The `DateFilter` controller makes it possible to create a date filter.
 */
export interface DateFilter extends Controller {
  /**
   * Deselects current filter.
   */
  deselect(): void;

  /**
   * Updates the selected range.
   *
   * @param range - The date range.
   */
  setRange(range: DateFilterRange): void;

  /**
   * The state of the `DateFacet` controller.
   */
  state: DateFilterState;
}

export function buildDateFilter(
  engine: SearchEngine,
  props: DateFilterProps
): DateFilter {
  if (!loadDateFilterReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const facetId = determineFacetId(engine, props.options);
  const options: RegisterDateFacetActionCreatorPayload = {
    ...props.options,
    currentValues: props.initialState
      ? [{...props.initialState, endInclusive: true, state: 'selected'}]
      : [],
    generateAutomaticRanges: false,
    facetId,
  };

  validateDateFacetOptions(engine, options);
  dispatch(registerDateFacet(options));

  return {
    ...controller,
    deselect: () => {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetClearAll(facetId)));
    },
    setRange: (range) => {
      const facetValue: DateFacetValue = {
        ...range,
        state: 'selected',
        numberOfResults: 0,
        endInclusive: true,
      };

      dispatch(
        updateDateFacetValues({
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
        | DateFacetResponse
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

function loadDateFilterReducer(
  engine: SearchEngine
): engine is SearchEngine<
  DateFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({dateFacetSet, configuration, search});
  return true;
}
