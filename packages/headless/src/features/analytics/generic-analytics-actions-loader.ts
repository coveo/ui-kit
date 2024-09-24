import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  logSearchEvent,
  LogSearchEventActionCreatorPayload,
  logClickEvent,
  LogClickEventActionCreatorPayload,
  logCustomEvent,
  LogCustomEventActionCreatorPayload,
} from './analytics-actions.js';
import {
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
