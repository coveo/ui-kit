import {SearchPageEvents as LegacySearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents.js';
import {Result} from '../../api/search/search/result.js';
import {
  validatePayload,
  requiredNonEmptyString,
  nonEmptyString,
} from '../../utils/validate-payload.js';
import {OmniboxSuggestionMetadata} from '../query-suggest/query-suggest-analytics-actions.js';
import {SearchAction} from '../search/search-actions.js';
import {
  ClickAction,
  CustomAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  LegacySearchAction,
  validateResultPayload,
} from './analytics-utils.js';
import {SearchPageEvents} from './search-action-cause.js';

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
export const interfaceLoad = (): SearchAction => ({
  actionCause: SearchPageEvents.interfaceLoad,
});

export const interfaceChange = (): SearchAction => ({
  actionCause: SearchPageEvents.interfaceChange,
});

export const searchFromLink = (): SearchAction => ({
  actionCause: SearchPageEvents.searchFromLink,
});

export const omniboxFromLink = (): SearchAction => ({
  actionCause: SearchPageEvents.omniboxFromLink,
});
