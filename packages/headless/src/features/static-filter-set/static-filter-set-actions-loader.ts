import type {PayloadAction} from '@reduxjs/toolkit';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {staticFilterSetReducer as staticFilterSet} from '../../features/static-filter-set/static-filter-set-slice.js';
import {
  deselectAllStaticFilterValues,
  type RegisterStaticFilterActionCreatorPayload,
  registerStaticFilter,
  type ToggleSelectStaticFilterValueActionCreatorPayload,
  toggleExcludeStaticFilterValue,
  toggleSelectStaticFilterValue,
} from './static-filter-set-actions.js';

export type {
  RegisterStaticFilterActionCreatorPayload,
  ToggleSelectStaticFilterValueActionCreatorPayload,
};

/**
 * The static filter set action creators.
 *
 * @group Actions
 * @category StaticFilterSet
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
   * Excludes a static filter value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleExcludeStaticFilterValue(
    payload: ToggleSelectStaticFilterValueActionCreatorPayload
  ): PayloadAction<ToggleSelectStaticFilterValueActionCreatorPayload>;

  /**
   * Deselects all values of a filter.
   *
   * @param id - The unique identifier of the static filter (for example, `"abc"`).
   * @returns A dispatchable action.
   */
  deselectAllStaticFilterValues(id: string): PayloadAction<string>;
}

/**
 * Loads the `staticFilterSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category StaticFilterSet
 */
export function loadStaticFilterSetActions(
  engine: SearchEngine
): StaticFilterSetActionCreators {
  engine.addReducers({staticFilterSet});

  return {
    registerStaticFilter,
    toggleSelectStaticFilterValue,
    toggleExcludeStaticFilterValue,
    deselectAllStaticFilterValues,
  };
}
