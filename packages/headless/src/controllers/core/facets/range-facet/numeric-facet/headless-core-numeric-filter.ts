import {configuration} from '../../../../../app/common-reducers';
import {CoreEngine} from '../../../../../app/engine';
import {
  facetOptions,
  numericFacetSet,
  search,
} from '../../../../../app/reducers';
import {
  disableFacet,
  enableFacet,
  updateFacetOptions,
} from '../../../../../features/facet-options/facet-options-actions';
import {isFacetEnabledSelector} from '../../../../../features/facet-options/facet-options-selectors';
import {isFacetLoadingResponseSelector} from '../../../../../features/facets/facet-set/facet-set-selectors';
import {NumericFacetValue} from '../../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {
  registerNumericFacet,
  RegisterNumericFacetActionCreatorPayload,
  updateNumericFacetValues,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {numericFacetSelectedValuesSelector} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-selectors';
import {
  ConfigurationSection,
  FacetOptionsSection,
  NumericFacetSection,
  SearchSection,
} from '../../../../../state/state-sections';
import {loadReducerError} from '../../../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../../../controller/headless-controller';
import {determineFacetId} from '../../_common/facet-id-determinor';
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
  const options: RegisterNumericFacetActionCreatorPayload = {
    ...props.options,
    currentValues: props.initialState?.range
      ? [{...props.initialState.range, endInclusive: true, state: 'selected'}]
      : [],
    generateAutomaticRanges: false,
    facetId,
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
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
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
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
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
