import {
  DateFacetRequest,
  DateRangeRequest,
} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {
  DateFacetResponse,
  DateFacetValue,
} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {
  RegisterDateFacetActionCreatorPayload,
  registerDateFacet,
} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {
  assertRangeFacetOptions,
  buildCoreRangeFacet,
} from '../headless-core-range-facet';
import {
  ConfigurationSection,
  DateFacetSection,
  FacetOptionsSection,
  SearchSection,
} from '../../../../../state/state-sections';
import {executeToggleDateFacetSelect} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-controller-actions';

import {
  DateFacetOptions,
  validateDateFacetOptions,
} from './headless-date-facet-options';
import {determineFacetId} from '../../_common/facet-id-determinor';
import {DateRangeOptions, DateRangeInput, buildDateRange} from './date-range';
import {Controller} from '../../../../controller/headless-controller';
import {RangeFacetSortCriterion} from '../../../../../features/facets/range-facets/generic/interfaces/request';
import {
  configuration,
  dateFacetSet,
  facetOptions,
  search,
} from '../../../../../app/reducers';
import {loadReducerError} from '../../../../../utils/errors';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions';
import {CoreEngine} from '../../../../../app/engine';
import {isFacetEnabledSelector} from '../../../../../features/facet-options/facet-options-selectors';
import {
  enableFacet,
  disableFacet,
} from '../../../../../features/facet-options/facet-options-actions';

export type {
  DateFacetOptions,
  DateRangeInput,
  DateRangeOptions,
  DateRangeRequest,
};
export {buildDateRange};

export interface DateFacetProps {
  /**
   * The options for the `DateFacet` controller.
   * */
  options: DateFacetOptions;
}

/**
 * The `DateFacet` controller makes it possible to create a facet with date ranges.
 * */
export interface DateFacet extends Controller {
  /**
   * Deselects all facet values.
   */
  deselectAll(): void;

  /**
   * Checks whether the facet values are sorted according to the specified criterion.
   *
   * @param criterion - The criterion to compare.
   * @returns Whether the facet values are sorted according to the specified criterion.
   */
  isSortedBy(criterion: RangeFacetSortCriterion): boolean;

  /**
   * Checks whether the specified facet value is selected.
   *
   * @param selection - The facet value to check.
   * @returns Whether the specified facet value is selected.
   */
  isValueSelected(selection: DateFacetValue): boolean;

  /** Sorts the facet values according to the specified criterion.
   *
   * @param criterion - The criterion by which to sort values.
   */
  sortBy(criterion: RangeFacetSortCriterion): void;

  /**
   * Toggles the specified facet value.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSelect(selection: DateFacetValue): void;

  /**
   * Toggles the specified facet value, deselecting others.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSingleSelect(selection: DateFacetValue): void;

  /**
   * Enables the facet
   */
  enable(): void;

  /**
   * Disables the facet
   */
  disable(): void;

  /**
   * The state of the `DateFacet` controller.
   */
  state: DateFacetState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `DateFacet` controller.
 */
export interface DateFacetState {
  /**
   * The facet ID.
   * */
  facetId: string;

  /**
   * The values of the facet.
   */
  values: DateFacetValue[];

  /**
   * The active sortCriterion of the facet.
   */
  sortCriterion: RangeFacetSortCriterion;

  /**
   * `true` if a search is in progress and `false` otherwise.
   */
  isLoading: boolean;

  /**
   * `true` if there is at least one non-idle value and `false` otherwise.
   */
  hasActiveValues: boolean;

  /** Whether the facet is enabled and its values are used to filter search results. */
  enabled: boolean;
}

/**
 * Creates a `DateFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `DateFacet` controller properties.
 * @returns A `DateFacet` controller instance.
 */
export function buildCoreDateFacet(
  engine: CoreEngine,
  props: DateFacetProps
): DateFacet {
  if (!loadDateFacetReducers(engine)) {
    throw loadReducerError;
  }

  assertRangeFacetOptions(props.options, 'buildDateFacet');

  const dispatch = engine.dispatch;

  const facetId = determineFacetId(engine, props.options);
  const options: RegisterDateFacetActionCreatorPayload = {
    currentValues: [],
    ...props.options,
    facetId,
  };

  validateDateFacetOptions(engine, options);

  const getIsEnabled = () => isFacetEnabledSelector(engine.state, facetId);

  dispatch(registerDateFacet(options));

  const rangeFacet = buildCoreRangeFacet<DateFacetRequest, DateFacetResponse>(
    engine,
    {
      facetId,
      getRequest: () => engine.state.dateFacetSet[facetId],
    }
  );

  return {
    ...rangeFacet,

    toggleSelect: (selection: DateFacetValue) =>
      dispatch(executeToggleDateFacetSelect({facetId, selection})),

    toggleSingleSelect: function (selection: DateFacetValue) {
      if (selection.state === 'idle') {
        dispatch(deselectAllFacetValues(facetId));
      }

      this.toggleSelect(selection);
    },

    enable() {
      dispatch(enableFacet(facetId));
    },

    disable() {
      dispatch(disableFacet(facetId));
    },

    get state() {
      const enabled = getIsEnabled();

      return {
        ...rangeFacet.state,
        enabled,
      };
    },
  };
}

function loadDateFacetReducers(
  engine: CoreEngine
): engine is CoreEngine<
  ConfigurationSection & SearchSection & DateFacetSection & FacetOptionsSection
> {
  engine.addReducers({configuration, search, dateFacetSet, facetOptions});
  return true;
}
