import {configuration} from '../../../../../app/common-reducers.js';
import type {CoreEngine} from '../../../../../app/engine.js';
import {
  disableFacet,
  enableFacet,
  updateFacetOptions,
} from '../../../../../features/facet-options/facet-options-actions.js';
import {isFacetEnabledSelector} from '../../../../../features/facet-options/facet-options-selectors.js';
import {facetOptionsReducer as facetOptions} from '../../../../../features/facet-options/facet-options-slice.js';
import {isFacetLoadingResponseSelector} from '../../../../../features/facets/facet-set/facet-set-selectors.js';
import {
  type RegisterDateFacetActionCreatorPayload,
  registerDateFacet,
  updateDateFacetValues,
} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions.js';
import {dateFacetSelectedValuesSelector} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-selectors.js';
import {dateFacetSetReducer as dateFacetSet} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import type {DateFacetValue} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/response.js';
import {searchReducer as search} from '../../../../../features/search/search-slice.js';
import {selectActiveTab} from '../../../../../features/tab-set/tab-set-selectors.js';
import type {
  ConfigurationSection,
  DateFacetSection,
  FacetOptionsSection,
  SearchSection,
} from '../../../../../state/state-sections.js';
import {loadReducerError} from '../../../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../../../controller/headless-controller.js';
import {determineFacetId} from '../../_common/facet-id-determinor.js';
import {validateDateFacetOptions} from './headless-date-facet-options.js';

/**
 * The options defining a `DateFilter`.
 */
export interface DateFilterOptions {
  /**
   * The values of which field to display in the filter.
   */
  field: string;

  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  facetId?: string;

  /**
   * The tabs on which the facet should be enabled or disabled.
   */
  tabs?: {included?: string[]; excluded?: string[]};

  /**
   * Whether to exclude folded result parents when estimating the result count for each facet value.
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   *
   * @defaultValue `true`
   */
  filterFacetCount?: boolean;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   *
   * Note: A high `injectionDepth` may negatively impact the facet request performance.
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

/**
 * A scoped and simplified part of the headless state that is relevant to the `DateFilter` controller.
 *
 * @group Controllers
 * @category DateFilter
 */
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

  /**
   * Whether the filter is enabled and its value is used to filter search results.
   */
  enabled: boolean;
}

/**
 * The `DateFilter` controller makes it possible to create a date filter.
 *
 * Example: [date-filter.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/date-filter/date-filter.fn.tsx)
 *
 * @group Controllers
 * @category DateFilter
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
  setRange(range: DateFilterRange): boolean;

  /**
   * Enables the filter. I.e., undoes the effects of `disable`.
   */
  enable(): void;

  /**
   * Disables the filter. I.e., prevents it from filtering results.
   */
  disable(): void;

  /**
   * The state of the `DateFilter` controller.
   */
  state: DateFilterState;
}

export function buildCoreDateFilter(
  engine: CoreEngine,
  props: DateFilterProps
): DateFilter {
  if (!loadDateFilterReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;
  const facetId = determineFacetId(engine, props.options);
  const tabs = props.options.tabs ?? {};
  const activeTab = selectActiveTab(engine.state.tabSet);
  const options: RegisterDateFacetActionCreatorPayload = {
    ...props.options,
    currentValues: props.initialState?.range
      ? [{...props.initialState.range, endInclusive: true, state: 'selected'}]
      : [],
    generateAutomaticRanges: false,
    facetId,
    tabs,
    activeTab,
  };

  validateDateFacetOptions(engine, options);
  dispatch(registerDateFacet(options));

  const getIsEnabled = () => isFacetEnabledSelector(engine.state, facetId);

  return {
    ...controller,
    clear: () => {
      dispatch(
        updateDateFacetValues({
          facetId,
          values: [],
        })
      );
      dispatch(updateFacetOptions());
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
      dispatch(updateFacetOptions());
      return true;
    },
    enable() {
      dispatch(enableFacet(facetId));
    },
    disable() {
      dispatch(disableFacet(facetId));
    },

    get state() {
      const isLoading = isFacetLoadingResponseSelector(getState());
      const enabled = getIsEnabled();
      const selectedRanges = dateFacetSelectedValuesSelector(
        getState(),
        facetId
      );
      const range = selectedRanges.length ? selectedRanges[0] : undefined;

      return {
        facetId,
        isLoading,
        range,
        enabled,
      };
    },
  };
}

function loadDateFilterReducer(
  engine: CoreEngine
): engine is CoreEngine<
  DateFacetSection & FacetOptionsSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({dateFacetSet, facetOptions, configuration, search});
  return true;
}
