import {AsyncThunkAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  logSearchEvent,
  LogSearchEventActionCreatorPayload,
  logClickEvent,
  LogClickEventActionCreatorPayload,
  logCustomEvent,
  LogCustomEventActionCreatorPayload,
  addPageViewEntryInActionsHistory,
} from './analytics-actions';
import {ClickAction, CustomAction, LegacySearchAction} from './analytics-utils';

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

  /**
   * Adds a PageView entry in the action history.
   * @param itemPermanentId - The permanent id of the item to add as PageView in actions history.
   * @returns A dispatchable action.
   */
  addPageViewEntryInActionsHistory(
    itemPermanentId: string
  ): AsyncThunkAction<void, string, {}>;
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
    addPageViewEntryInActionsHistory,
  };
}
