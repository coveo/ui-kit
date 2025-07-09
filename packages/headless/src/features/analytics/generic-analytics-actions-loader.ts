import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  type LogClickEventActionCreatorPayload,
  type LogCustomEventActionCreatorPayload,
  type LogSearchEventActionCreatorPayload,
  logClickEvent,
  logCustomEvent,
  logSearchEvent,
} from './analytics-actions.js';
import type {
  ClickAction,
  CustomAction,
  LegacySearchAction,
} from './analytics-utils.js';

export type {
  LogSearchEventActionCreatorPayload,
  LogClickEventActionCreatorPayload,
  LogCustomEventActionCreatorPayload,
};

/**
 * The generic analytics action creators.
 *
 * @group Actions
 * @category GenericAnalytics
 */
export interface GenericAnalyticsActionCreators {
  /**
   * Creates a search analytics event.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logSearchEvent(
    payload: LogSearchEventActionCreatorPayload
  ): LegacySearchAction;

  /**
   * Creates a click analytics event.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logClickEvent(payload: LogClickEventActionCreatorPayload): ClickAction;

  /**
   * Creates a custom analytics event.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logCustomEvent(payload: LogCustomEventActionCreatorPayload): CustomAction;
}

/**
 * Returns possible generic analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category GenericAnalytics
 */
export function loadGenericAnalyticsActions(
  engine: SearchEngine
): GenericAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logSearchEvent,
    logClickEvent,
    logCustomEvent,
  };
}
