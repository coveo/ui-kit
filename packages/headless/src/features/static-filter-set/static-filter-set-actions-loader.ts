import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../..';
import {staticFilterSet} from '../../app/reducers';
import {
  registerStaticFilter,
  RegisterStaticFilterActionCreatorPayload,
  toggleSelectStaticFilterValue,
  ToggleSelectStaticFilterValueActionCreatorPayload,
  deselectAllStaticFilterValues,
  deselectAllStaticFilters,
} from './static-filter-set-actions';

export {
  RegisterStaticFilterActionCreatorPayload,
  ToggleSelectStaticFilterValueActionCreatorPayload,
};

/**
 * The static filter set action creators.
 */
export interface StaticFilterSetActionCreators {
  /**
   * Registers a static filter.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerStaticFilter(
    payload: RegisterStaticFilterActionCreatorPayload
  ): PayloadAction<RegisterStaticFilterActionCreatorPayload>;

  /**
   * Toggles a static filter value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectStaticFilterValue(
    payload: ToggleSelectStaticFilterValueActionCreatorPayload
  ): PayloadAction<ToggleSelectStaticFilterValueActionCreatorPayload>;

  /**
   * Deselects all values of a filter.
   *
   * @param id - The unique identifier of the static filter (e.g., `"abc"`).
   * @returns A dispatchable action.
   */
  deselectAllStaticFilterValues(id: string): PayloadAction<string>;

  /**
   * Deselects all values in all static filters.
   *
   * @returns A dispatchable action.
   */
  deselectAllStaticFilters(): PayloadAction;
}

/**
 * Loads the `staticFilterSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadStaticFilterSetActions(
  engine: SearchEngine
): StaticFilterSetActionCreators {
  engine.addReducers({staticFilterSet});

  return {
    registerStaticFilter,
    toggleSelectStaticFilterValue,
    deselectAllStaticFilterValues,
    deselectAllStaticFilters,
  };
}
