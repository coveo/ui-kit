import {
  ConfigurationSection,
  NumericFacetSection,
  SearchSection,
} from '../../../../../state/state-sections';
import {loadReducerError} from '../../../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../../../controller/headless-controller';
import {
  configuration,
  numericFacetSet,
  search,
} from '../../../../../app/reducers';
import {determineFacetId} from '../../_common/facet-id-determinor';
import {NumericFacetValue} from '../../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions';
import {
  registerNumericFacet,
  RegisterNumericFacetActionCreatorPayload,
  updateNumericFacetValues,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {validateNumericFacetOptions} from './headless-numeric-facet-options';
import {numericFacetSelectedValuesSelector} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-selectors';
import {CoreEngine} from '../../../../../app/engine';
import {isFacetLoadingResponseSelector} from '../../../../../features/facets/facet-set/facet-set-selectors';

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
   * The state of the `NumericFacet` controller.
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

    get state() {
      const isLoading = isFacetLoadingResponseSelector(getState());
      const selectedRanges = numericFacetSelectedValuesSelector(
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

function loadNumericFilterReducer(
  engine: CoreEngine
): engine is CoreEngine<
  NumericFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({numericFacetSet, configuration, search});
  return true;
}
