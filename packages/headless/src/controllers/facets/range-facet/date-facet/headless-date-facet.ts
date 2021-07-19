import {DateFacetRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {DateFacetResponse} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {
  RegisterDateFacetActionCreatorPayload,
  registerDateFacet,
} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {
  assertRangeFacetOptions,
  buildRangeFacet,
} from '../headless-range-facet';
import {
  ConfigurationSection,
  DateFacetSection,
  RelativeDateSection,
  SearchSection,
} from '../../../../state/state-sections';
import {executeToggleDateFacetSelect} from '../../../../features/facets/range-facets/date-facet-set/date-facet-controller-actions';

import {
  DateFacetOptions,
  validateDateFacetOptions,
  DateRangeRequest,
} from './headless-date-facet-options';
import {determineFacetId} from '../../_common/facet-id-determinor';
import {DateRangeOptions, DateRangeInput, buildDateRange} from './date-range';
import {Controller} from '../../../controller/headless-controller';
import {RangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/interfaces/request';
import {
  configuration,
  dateFacetSet,
  search,
  relativeDateSet,
} from '../../../../app/reducers';
import {loadReducerError} from '../../../../utils/errors';
import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {deselectAllFacetValues} from '../../../../features/facets/facet-set/facet-set-actions';
import {FacetValueState} from '../../facet/headless-facet';
import {
  formatRelativeDate,
  RelativeDate,
} from '../../../../features/relative-date-set/relative-date';
import {registerRelativeDate} from '../../../../features/relative-date-set/relative-date-actions';

export {
  DateFacetOptions,
  DateRangeInput,
  DateRangeOptions,
  DateRangeRequest,
  buildDateRange,
};

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
   * The state of the `DateFacet` controller.
   */
  state: DateFacetState;
}

export interface DateFacetValue {
  /**
   * The number of results that have the facet value.
   */
  numberOfResults: number;

  /**
   * The starting value for the date range, formatted as `YYYY/MM/DD@HH:mm:ss`.
   */
  start: string;

  /**
   * The ending value for the date range, formatted as `YYYY/MM/DD@HH:mm:ss`.
   */
  end: string;

  /**
   * The dynamic relative date.
   */
  relativeStart?: RelativeDate;

  /**
   * The dynamic relative date.
   */
  relativeEnd?: RelativeDate;

  /**
   * Whether or not the end value is included in the range.
   */
  endInclusive: boolean;

  /**
   * The state of the facet value, indicating whether it is filtering results (`selected`) or not (`idle`).
   */
  state: FacetValueState;
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
}

/**
 * Creates a `DateFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `DateFacet` controller properties.
 * @returns A `DateFacet` controller instance.
 */
export function buildDateFacet(
  engine: SearchEngine,
  props: DateFacetProps
): DateFacet {
  if (!loadDateFacetReducers(engine)) {
    throw loadReducerError;
  }

  assertRangeFacetOptions(props.options, 'buildDateFacet');

  const dispatch = engine.dispatch;

  const facetId = determineFacetId(engine, props.options);

  const convertDateValue = (value: string | RelativeDate) => {
    if (typeof value === 'string') {
      return value;
    }

    const formattedDate = formatRelativeDate(value);
    dispatch(
      registerRelativeDate({
        id: facetId,
        absoluteDate: formattedDate,
        relativeDate: value,
      })
    );
    return formattedDate;
  };
  const convertDateRange = (range: DateRangeRequest) => ({
    ...range,
    start: convertDateValue(range.start),
    end: convertDateValue(range.end),
  });

  const options: RegisterDateFacetActionCreatorPayload = {
    ...props.options,
    currentValues: props.options.currentValues
      ? props.options.currentValues.map(convertDateRange)
      : undefined,
    facetId,
  };

  validateDateFacetOptions(engine, options);

  dispatch(registerDateFacet({...options}));

  const rangeFacet = buildRangeFacet<DateFacetRequest, DateFacetResponse>(
    engine,
    {
      facetId,
      getRequest: () => engine.state.dateFacetSet[facetId],
    }
  );

  const handleToggleSelect = (selection: DateFacetValue) => {
    dispatch(executeToggleDateFacetSelect({facetId, selection}));
  };

  return {
    ...rangeFacet,

    toggleSelect: (selection: DateFacetValue) => handleToggleSelect(selection),

    toggleSingleSelect: (selection: DateFacetValue) => {
      if (selection.state === 'idle') {
        dispatch(deselectAllFacetValues(facetId));
      }

      handleToggleSelect(selection);
    },

    get state() {
      return rangeFacet.state;
    },
  };
}

function loadDateFacetReducers(
  engine: SearchEngine
): engine is SearchEngine<
  ConfigurationSection & SearchSection & DateFacetSection & RelativeDateSection
> {
  engine.addReducers({configuration, search, dateFacetSet, relativeDateSet});
  return true;
}
