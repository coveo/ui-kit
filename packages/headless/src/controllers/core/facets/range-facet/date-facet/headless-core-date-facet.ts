import {configuration} from '../../../../../app/common-reducers.js';
import type {CoreEngine} from '../../../../../app/engine.js';
import {facetOptionsReducer as facetOptions} from '../../../../../features/facet-options/facet-options-slice.js';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions.js';
import {
  type RegisterDateFacetActionCreatorPayload,
  registerDateFacet,
} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions.js';
import {
  executeToggleDateFacetExclude,
  executeToggleDateFacetSelect,
} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-controller-actions.js';
import {dateFacetSetReducer as dateFacetSet} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import type {
  DateFacetRequest,
  DateRangeRequest,
} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/request.js';
import type {
  DateFacetResponse,
  DateFacetValue,
} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/response.js';
import type {RangeFacetSortCriterion} from '../../../../../features/facets/range-facets/generic/interfaces/request.js';
import {searchReducer as search} from '../../../../../features/search/search-slice.js';
import {selectActiveTab} from '../../../../../features/tab-set/tab-set-selectors.js';
import type {
  ConfigurationSection,
  DateFacetSection,
  FacetOptionsSection,
  SearchSection,
} from '../../../../../state/state-sections.js';
import {loadReducerError} from '../../../../../utils/errors.js';
import type {Controller} from '../../../../controller/headless-controller.js';
import {determineFacetId} from '../../_common/facet-id-determinor.js';
import {assertRangeFacetOptions} from '../core-range-facet-utils.js';
import {buildCoreRangeFacet} from '../headless-core-range-facet.js';
import {
  buildDateRange,
  type DateRangeInput,
  type DateRangeOptions,
} from './date-range.js';
import {
  type DateFacetOptions,
  validateDateFacetOptions,
} from './headless-date-facet-options.js';

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
 *
 * Examples:
 * - [date-facet.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/date-facet/date-facet.fn.tsx)
 * - [relative-date-facet.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/relative-date-facet/relative-date-facet.fn.tsx)
 *
 * @document relative-date-format.md
 *
 * @group Controllers
 * @category DateFacet
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
   * Toggles exclusion of the specified facet value
   *
   * @param selection - The facet value to toggle.
   */
  toggleExclude(selection: DateFacetValue): void;

  /**
   * Toggles the specified facet value, deselecting others.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSingleSelect(selection: DateFacetValue): void;

  /**
   * Toggles exclusion of the specified facet value, deselecting others.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSingleExclude(selection: DateFacetValue): void;

  /**
   * Enables the facet. I.e., undoes the effects of `disable`.
   */
  enable(): void;

  /**
   * Disables the facet. I.e., prevents it from filtering results.
   */
  disable(): void;

  /**
   * The state of the `DateFacet` controller.
   */
  state: DateFacetState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `DateFacet` controller.
 *
 * @group Controllers
 * @category DateFacet
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

  /**
   * Whether the facet is enabled and its values are used to filter search results.
   */
  enabled: boolean;
}

/**
 * Creates a `DateFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `DateFacet` controller properties.
 * @returns A `DateFacet` controller instance.
 *
 * @group Controllers
 * @category DateFacet
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
  const tabs = props.options.tabs ?? {};
  const activeTab = selectActiveTab(engine.state.tabSet);
  const options: RegisterDateFacetActionCreatorPayload = {
    currentValues: [],
    ...props.options,
    facetId,
    tabs,
    activeTab,
  };

  validateDateFacetOptions(engine, options);

  dispatch(registerDateFacet(options));

  const rangeFacet = buildCoreRangeFacet<DateFacetRequest, DateFacetResponse>(
    engine,
    {
      facetId,
      getRequest: () => engine.state.dateFacetSet[facetId]!.request,
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

    toggleExclude: (selection: DateFacetValue) =>
      dispatch(executeToggleDateFacetExclude({facetId, selection})),

    toggleSingleExclude: function (selection: DateFacetValue) {
      if (selection.state === 'idle') {
        dispatch(deselectAllFacetValues(facetId));
      }

      this.toggleExclude(selection);
    },

    get state() {
      return rangeFacet.state;
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
