import {Schema} from '@coveo/bueno';
import {buildController, Controller} from '..';
import {SearchEngine} from '../..';
import {staticFilterSet} from '../../app/reducers';
import {
  staticFilterIdSchema,
  staticFilterValuesSchema,
} from '../../features/static-filter-set/static-filter-set-schema';
import {
  deselectAllStaticFilterValues,
  registerStaticFilter,
  toggleSelectStaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-actions';
import {
  StaticFilterValue,
  StaticFilterValueState,
} from '../../features/static-filter-set/static-filter-set-state';
import {StaticFilterSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {validateOptions} from '../../utils/validate-payload';
import {executeSearch} from '../../features/search/search-actions';
import {noopSearchAnalyticsAction} from '../../features/analytics/analytics-utils';

export {StaticFilterValue, StaticFilterValueState};

const optionsSchema = new Schema<Required<StaticFilterOptions>>({
  id: staticFilterIdSchema,
  values: staticFilterValuesSchema,
});

export interface StaticFilterProps {
  /**
   * The options for the `StaticFilter` controller.
   */
  options: StaticFilterOptions;
}

export interface StaticFilterOptions {
  /**
   * A unique identifier for the static filter.
   */
  id: string;

  /**
   * The values the static filter is responsible for managing.
   */
  values: StaticFilterValue[];
}

/**
 * The `StaticFilter` controller manages a collection of filter values.
 * */
export interface StaticFilter extends Controller {
  /**
   * Toggles the specified static filter value.
   *
   * @param value - The static filter value to toggle.
   */
  toggleSelect(value: StaticFilterValue): void;

  /**
   * Toggles the specified static filter value, deselecting others.
   *
   * @param value - The static filter value to toggle.
   */
  toggleSingleSelect(value: StaticFilterValue): void;

  /**
   * Deselects all static filter values.
   * */
  deselectAll(): void;

  /**
   * A state of the `StaticFilter` controller.
   */
  state: StaticFilterState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `StaticFilter` controller.
 */
export interface StaticFilterState {
  /**
   * The static filter id.
   */
  id: string;

  /**
   * The static filter values.
   */
  values: StaticFilterValue[];

  /**
   * `true` if there is at least one non-idle value and `false` otherwise.
   */
  hasActiveValues: boolean;
}

/**
 * Creates a `Static Filter` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildStaticFilter(
  engine: SearchEngine,
  props: StaticFilterProps
): StaticFilter {
  if (!loadReducers(engine)) {
    throw loadReducerError;
  }

  validateOptions(engine, optionsSchema, props.options, 'buildStaticFilter');

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;
  const {id} = props.options;

  dispatch(registerStaticFilter(props.options));

  return {
    ...controller,

    toggleSelect(value: StaticFilterValue) {
      dispatch(toggleSelectStaticFilterValue({id, value}));
      dispatch(executeSearch(noopSearchAnalyticsAction()));
    },

    toggleSingleSelect(value: StaticFilterValue) {
      if (value.state === 'idle') {
        dispatch(deselectAllStaticFilterValues(id));
      }

      dispatch(toggleSelectStaticFilterValue({id, value}));
      dispatch(executeSearch(noopSearchAnalyticsAction()));
    },

    deselectAll() {
      dispatch(deselectAllStaticFilterValues(id));
      dispatch(executeSearch(noopSearchAnalyticsAction()));
    },

    get state() {
      const values = getState().staticFilterSet[id]?.values || [];
      const hasActiveValues = values.some((value) => value.state !== 'idle');

      return {
        id,
        values,
        hasActiveValues,
      };
    },
  };
}

function loadReducers(
  engine: SearchEngine
): engine is SearchEngine<StaticFilterSection> {
  engine.addReducers({staticFilterSet});
  return true;
}
