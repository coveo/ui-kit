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
import type {NumericFacetValue} from '../../../../../features/facets/range-facets/numeric-facet-set/interfaces/response.js';
import {
  type RegisterNumericFacetActionCreatorPayload,
  registerNumericFacet,
  updateNumericFacetValues,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {numericFacetSelectedValuesSelector} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-selectors.js';
import {numericFacetSetReducer as numericFacetSet} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {searchReducer as search} from '../../../../../features/search/search-slice.js';
import {selectActiveTab} from '../../../../../features/tab-set/tab-set-selectors.js';
import type {
  ConfigurationSection,
  FacetOptionsSection,
  NumericFacetSection,
  SearchSection,
} from '../../../../../state/state-sections.js';
import {loadReducerError} from '../../../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../../../controller/headless-controller.js';
import {determineFacetId} from '../../_common/facet-id-determinor.js';
import {validateNumericFacetOptions} from './headless-numeric-facet-options.js';

/**
 * The options defining a `NumericFilter`.
 */
export interface NumericFilterOptions {
  /**
   * The values of which field to display in the filter.
   */
  field: string;

  /**
   * The tabs on which the facet should be enabled or disabled.
   */
  tabs?: {included?: string[]; excluded?: string[]};

  /**
   * A unique identifier for the controller.
   * By default, a unique random ID is generated.
   */
  facetId?: string;

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

export interface NumericFilterInitialState {
  /**
   * The initial selected range.
   */
  range: NumericFilterRange;
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
   * The initial state.
   */
  initialState?: NumericFilterInitialState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `NumericFilter` controller.
 *
 * @group Controllers
 * @category NumericFilter
 */
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

  /**
   * Whether the filter is enabled and its value is used to filter search results.
   */
  enabled: boolean;
}

/**
 * The `NumericFilter` controller makes it possible to create a numeric filter.
 *
 * Example: [numeric-filter.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/numeric-filter/numeric-filter.fn.tsx)
 *
 * @group Controllers
 * @category NumericFilter
 */
export interface NumericFilter extends Controller {
  /**
   * Clears the current filter.
   */
  clear(): void;

  /**
   * Updates the selected range.
   *
   * @param range - The numeric range.
   * @returns Whether the range is valid.
   */
  setRange(range: NumericFilterRange): boolean;

  /**
   * Enables the filter. I.e., undoes the effects of `disable`.
   */
  enable(): void;

  /**
   * Disables the filter. I.e., prevents it from filtering results.
   */
  disable(): void;

  /**
   * The state of the `NumericFilter` controller.
   */
  state: NumericFilterState;
}

export function buildCoreNumericFilter(
  engine: CoreEngine,
  props: NumericFilterProps
): NumericFilter {
  if (!loadNumericFilterReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;
  const facetId = determineFacetId(engine, props.options);
  const tabs = props.options.tabs ?? {};
  const activeTab = selectActiveTab(engine.state.tabSet);
  const options: RegisterNumericFacetActionCreatorPayload = {
    ...props.options,
    currentValues: props.initialState?.range
      ? [{...props.initialState.range, endInclusive: true, state: 'selected'}]
      : [],
    generateAutomaticRanges: false,
    facetId,
    tabs,
    activeTab,
  };

  validateNumericFacetOptions(engine, options);
  dispatch(registerNumericFacet(options));

  const getIsEnabled = () => isFacetEnabledSelector(engine.state, facetId);

  return {
    ...controller,
    clear: () => {
      dispatch(
        updateNumericFacetValues({
          facetId,
          values: [],
        })
      );
      dispatch(updateFacetOptions());
    },
    setRange: (range) => {
      const facetValue: NumericFacetValue = {
        ...range,
        state: 'selected',
        numberOfResults: 0,
        endInclusive: true,
      };

      const updateFacetValuesAction = updateNumericFacetValues({
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
      const selectedRanges = numericFacetSelectedValuesSelector(
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

function loadNumericFilterReducer(
  engine: CoreEngine
): engine is CoreEngine<
  NumericFacetSection &
    FacetOptionsSection &
    ConfigurationSection &
    SearchSection
> {
  engine.addReducers({numericFacetSet, facetOptions, configuration, search});
  return true;
}
