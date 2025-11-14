import {Schema} from '@coveo/bueno';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {
  deselectAllStaticFilterValues,
  logStaticFilterClearAll,
  logStaticFilterDeselect,
  logStaticFilterSelect,
  registerStaticFilter,
  toggleExcludeStaticFilterValue,
  toggleSelectStaticFilterValue,
} from '../../features/static-filter-set/static-filter-set-actions.js';
import {
  staticFilterIdSchema,
  staticFilterValuesSchema,
} from '../../features/static-filter-set/static-filter-set-schema.js';
import {staticFilterSetReducer as staticFilterSet} from '../../features/static-filter-set/static-filter-set-slice.js';
import type {
  StaticFilterValue,
  StaticFilterValueState,
} from '../../features/static-filter-set/static-filter-set-state.js';
import type {StaticFilterSection} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {validateOptions} from '../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../controller/headless-controller.js';
import {
  buildStaticFilterValue,
  type StaticFilterValueOptions,
} from './static-filter-value.js';

export type {
  StaticFilterValue,
  StaticFilterValueState,
  StaticFilterValueOptions,
};
export {buildStaticFilterValue};

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
 *
 * Example: [static-filter.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/static-filter/static-filter.fn.tsx)
 *
 * @group Controllers
 * @category StaticFilter
 * */
export interface StaticFilter extends Controller {
  /**
   * Toggles the specified static filter value.
   *
   * @param value - The static filter value to toggle.
   */
  toggleSelect(value: StaticFilterValue): void;

  /**
   * Excludes the specified static filter value.
   *
   * @param value - The static filter value to toggle.
   */
  toggleExclude(value: StaticFilterValue): void;

  /**
   * Toggles the specified static filter value, deselecting others.
   *
   * @param value - The static filter value to toggle.
   */
  toggleSingleSelect(value: StaticFilterValue): void;

  /**
   * Excludes the specified static filter value, deselecting others.
   *
   * @param value - The static filter value to toggle exclusion.
   */
  toggleSingleExclude(value: StaticFilterValue): void;

  /**
   * Deselects all static filter values.
   * */
  deselectAll(): void;

  /**
   * Checks whether the specified static filter value is selected.
   *
   * @param value - The static filter value to check.
   * @returns Whether the specified static filter value is selected.
   */
  isValueSelected(value: StaticFilterValue): boolean;

  /**
   * Checks whether the specified static filter value is excluded.
   *
   * @param value - The static filter value to check.
   * @returns Whether the specified static filter value is excluded.
   */
  isValueExcluded(value: StaticFilterValue): boolean;

  /**
   * A state of the `StaticFilter` controller.
   */
  state: StaticFilterState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `StaticFilter` controller.
 *
 * @group Controllers
 * @category StaticFilter
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
 *
 * @group Controllers
 * @category StaticFilter
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
      dispatch(
        executeSearch({
          legacy: getLegacyAnalyticsActionForToggledValue(id, value),
        })
      );
    },

    toggleSingleSelect(value: StaticFilterValue) {
      if (value.state === 'idle') {
        dispatch(deselectAllStaticFilterValues(id));
      }

      dispatch(toggleSelectStaticFilterValue({id, value}));
      dispatch(
        executeSearch({
          legacy: getLegacyAnalyticsActionForToggledValue(id, value),
        })
      );
    },

    toggleExclude(value: StaticFilterValue) {
      dispatch(toggleExcludeStaticFilterValue({id, value}));
      dispatch(
        executeSearch({
          legacy: getLegacyAnalyticsActionForToggledValue(id, value),
        })
      );
    },

    toggleSingleExclude(value: StaticFilterValue) {
      if (value.state === 'idle') {
        dispatch(deselectAllStaticFilterValues(id));
      }

      dispatch(toggleExcludeStaticFilterValue({id, value}));
      dispatch(
        executeSearch({
          legacy: getLegacyAnalyticsActionForToggledValue(id, value),
        })
      );
    },

    deselectAll() {
      dispatch(deselectAllStaticFilterValues(id));
      dispatch(
        executeSearch({
          legacy: logStaticFilterClearAll({staticFilterId: id}),
        })
      );
    },

    isValueSelected(value: StaticFilterValue) {
      return value.state === 'selected';
    },

    isValueExcluded(value: StaticFilterValue) {
      return value.state === 'excluded';
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

function getLegacyAnalyticsActionForToggledValue(
  id: string,
  value: StaticFilterValue
) {
  const {caption, expression, state} = value;
  const analytics =
    state === 'idle' ? logStaticFilterSelect : logStaticFilterDeselect;

  return analytics({
    staticFilterId: id,
    staticFilterValue: {caption, expression},
  });
}
