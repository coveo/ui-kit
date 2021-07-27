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
import {determineFacetId} from '../../_common/facet-id-determinor';
import {DateFacetValue} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response';
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
import {dateFacetSelectedValuesSelector} from '../../../../features/facets/range-facets/date-facet-set/date-facet-selectors';

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

export interface DateFilterInitialState {
  /**
   * The initial selected range.
   */
  range: DateFilterRange;
}

export interface DateFilterRange {
  /**
   * The starting value for the date range, formatted as `YYYY/MM/DD@HH:mm:ss` or the Relative date format "period-amount-unit"
   */
  start: string;

  /**
   * The ending value for the date range, formatted as `YYYY/MM/DD@HH:mm:ss` or the Relative date format "period-amount-unit"
   */
  end: string;
}

export interface DateFilterProps {
  /**
   * The options for the `DateFilter` controller.
   */
  options: DateFilterOptions;
  /**
   * The initial state.
   */
  initialState?: DateFilterInitialState;
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
   * Returns `true` if a search is in progress, and `false` if not.
   */
  isLoading: boolean;
}

/**
 * The `DateFilter` controller makes it possible to create a date filter.
 */
export interface DateFilter extends Controller {
  /**
   * Clears the current filter.
   */
  clear(): void;

  /**
   * Updates the selected range.
   *
   * You can use the `buildDateRange` utility method in order to format the range values correctly.
   *
   * @param range - The date range.
   * @returns Whether the range is valid.
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
  const getState = () => engine.state;
  const facetId = determineFacetId(engine, props.options);
  const options: RegisterDateFacetActionCreatorPayload = {
    ...props.options,
    currentValues: props.initialState?.range
      ? [{...props.initialState.range, endInclusive: true, state: 'selected'}]
      : [],
    generateAutomaticRanges: false,
    facetId,
  };

  validateDateFacetOptions(engine, options);
  dispatch(registerDateFacet(options));

  return {
    ...controller,
    clear: () => {
      dispatch(
        updateDateFacetValues({
          facetId,
          values: [],
        })
      );
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

      const updateFacetValuesAction = updateDateFacetValues({
        facetId,
        values: [facetValue],
      });

      if (updateFacetValuesAction.error) {
        return false;
      }

      dispatch(updateFacetValuesAction);
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(
        executeSearch(
          logFacetSelect({
            facetId,
            facetValue: `${facetValue.start}..${facetValue.end}`,
          })
        )
      );
      return true;
    },

    get state() {
      const isLoading = getState().search.isLoading;
      const selectedRanges = dateFacetSelectedValuesSelector(
        getState(),
        facetId
      );
      const range = selectedRanges.length ? selectedRanges[0] : undefined;

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
