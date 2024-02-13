import {createAsyncThunk} from '@reduxjs/toolkit';
import {SearchPageEvents as LegacySearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {historyStore} from '../../api/analytics/coveo-analytics-utils';
import {SearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {Result} from '../../api/search/search/result';
import {SearchAppState} from '../../state/search-app-state';
import {
  validatePayload,
  requiredNonEmptyString,
  nonEmptyString,
} from '../../utils/validate-payload';
import {OmniboxSuggestionMetadata} from '../query-suggest/query-suggest-analytics-actions';
import {SearchAction} from '../search/search-actions';
import {
  ClickAction,
  CustomAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  LegacySearchAction,
  validateResultPayload,
} from './analytics-utils';
import {SearchPageEvents} from './search-action-cause';

export interface SearchEventPayload {
  /** The identifier of the search action (e.g., `interfaceLoad`). */
  evt: LegacySearchPageEvents | string;
  /** The event metadata. */
  meta?: Record<string, unknown>;
}

export interface ClickEventPayload {
  /**
   * The identifier of the click action.
   */
  evt: LegacySearchPageEvents | string;
  /**
   * The result associated with the click event.
   */
  result: Result;
  /**
   * The event metadata.
   */
  meta?: Record<string, unknown>;
}

export interface CustomEventPayload {
  /**
   * The event cause identifier of the custom action
   */
  evt: LegacySearchPageEvents | string;
  /**
   * The event type identifier of the custom action
   */
  type: string;
  /** The event metadata. */
  meta?: Record<string, unknown>;
}

const validateEvent = (p: {evt: string; type?: string}) =>
  validatePayload(p, {
    evt: requiredNonEmptyString,
    type: nonEmptyString,
  });

export interface LogSearchEventActionCreatorPayload {
  /**
   * The identifier of the search action (e.g., `interfaceLoad`).
   * */
  evt: string;
  /**
   * The event metadata.
   * */
  meta?: Record<string, unknown>;
}

export const logSearchEvent = (
  p: LogSearchEventActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/generic/search', (client) => {
    validateEvent(p);
    const {evt, meta} = p;
    return client.makeSearchEvent(evt as LegacySearchPageEvents, meta);
  });

export interface LogClickEventActionCreatorPayload {
  /**
   * The identifier of the click action (e.g., `documentOpen`).
   * */
  evt: string;

  /**
   * The result associated with the click event.
   */
  result: Result;

  /**
   * The event metadata.
   * */
  meta?: Record<string, unknown>;
}

export const logClickEvent = (
  p: LogClickEventActionCreatorPayload
): ClickAction =>
  makeAnalyticsAction('analytics/generic/click', (client, state) => {
    validateResultPayload(p.result);
    validateEvent(p);

    return client.makeClickEvent(
      p.evt as LegacySearchPageEvents,
      partialDocumentInformation(p.result, state),
      documentIdentifier(p.result),
      p.meta
    );
  });

export interface LogCustomEventActionCreatorPayload {
  /**
   * The event cause identifier of the custom action
   */
  evt: string;
  /**
   * The event type identifier of the custom action
   */
  type: string;
  /**
   * The event metadata.
   * */
  meta?: Record<string, unknown>;
}

export const logCustomEvent = (
  p: LogCustomEventActionCreatorPayload
): CustomAction =>
  makeAnalyticsAction('analytics/generic/custom', (client) => {
    validateEvent(p);
    return client.makeCustomEventWithType(p.evt, p.type, p.meta);
  });

//TODO: KIT-2859
export const logInterfaceLoad = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/interface/load', (client) =>
    client.makeInterfaceLoad()
  );

//TODO: KIT-2859
export const logInterfaceChange = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/interface/change', (client, state) =>
    client.makeInterfaceChange({
      interfaceChangeTo: state.configuration.analytics.originLevel2,
    })
  );

//TODO: KIT-2859
export const logSearchFromLink = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/interface/searchFromLink', (client) =>
    client.makeSearchFromLink()
  );

//TODO: KIT-2859
export const logOmniboxFromLink = (
  metadata: OmniboxSuggestionMetadata
): LegacySearchAction =>
  makeAnalyticsAction('analytics/interface/omniboxFromLink', (client) =>
    client.makeOmniboxFromLink(metadata)
  );

// --------------------- KIT-2859 : Everything above this will get deleted ! :) ---------------------
export const interfaceLoad = (): SearchAction => {
  return {
    actionCause: SearchPageEvents.interfaceLoad,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getBaseMetadata(),
  };
};

export const interfaceChange = (): SearchAction => {
  return {
    actionCause: SearchPageEvents.interfaceChange,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getInterfaceChangeMetadata(),
  };
};

export const searchFromLink = (): SearchAction => {
  return {
    actionCause: SearchPageEvents.searchFromLink,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getBaseMetadata(),
  };
};

export const omniboxFromLink = (
  metadata: OmniboxSuggestionMetadata
): SearchAction => {
  return {
    actionCause: SearchPageEvents.omniboxFromLink,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getOmniboxFromLinkMetadata(
        metadata
      ),
  };
};

export const addPageViewEntryInActionsHistory = createAsyncThunk(
  'analytics/actionsHistory/addPageView',
  async (itemPermanentId: string, {getState}) => {
    const state = getState() as SearchAppState;
    if (state.configuration.analytics.enabled) {
      historyStore.addElement({
        name: 'PageView',
        value: itemPermanentId,
        time: JSON.stringify(new Date()),
      });
    }
  }
);
