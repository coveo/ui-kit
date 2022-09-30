import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {
  validatePayload,
  requiredNonEmptyString,
  nonEmptyString,
} from '../../utils/validate-payload';
import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  ClickAction,
  CustomAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  SearchAction,
  validateResultPayload,
} from './analytics-utils';
import {OmniboxSuggestionMetadata} from '../query-suggest/query-suggest-analytics-actions';

export interface SearchEventPayload {
  /** The identifier of the search action (e.g., `interfaceLoad`). */
  evt: SearchPageEvents | string;
  /** The event metadata. */
  meta?: Record<string, unknown>;
}

export interface ClickEventPayload {
  /**
   * The identifier of the click action.
   */
  evt: SearchPageEvents | string;
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
  evt: SearchPageEvents | string;
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
): SearchAction =>
  makeAnalyticsAction(
    'analytics/generic/search',
    AnalyticsType.Search,
    (client) => {
      validateEvent(p);
      const {evt, meta} = p;
      return client.makeSearchEvent(evt as SearchPageEvents, meta);
    }
  );

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
  makeAnalyticsAction(
    'analytics/generic/click',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(p.result);
      validateEvent(p);

      return client.makeClickEvent(
        p.evt as SearchPageEvents,
        partialDocumentInformation(p.result, state),
        documentIdentifier(p.result),
        p.meta
      );
    }
  );

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
  makeAnalyticsAction(
    'analytics/generic/custom',
    AnalyticsType.Custom,
    (client) => {
      validateEvent(p);
      return client.makeCustomEventWithType(p.evt, p.type, p.meta);
    }
  );

export const logInterfaceLoad = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/interface/load',
    AnalyticsType.Search,
    (client) => client.makeInterfaceLoad()
  );

export const logInterfaceChange = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/interface/change',
    AnalyticsType.Search,
    (client, state) =>
      client.makeInterfaceChange({
        interfaceChangeTo: state.configuration.analytics.originLevel2,
      })
  );

export const logSearchFromLink = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/interface/searchFromLink',
    AnalyticsType.Search,
    (client) => client.makeSearchFromLink()
  );

export const logOmniboxFromLink = (
  metadata: OmniboxSuggestionMetadata
): SearchAction =>
  makeAnalyticsAction(
    'analytics/interface/omniboxFromLink',
    AnalyticsType.Search,
    (client) => client.makeOmniboxFromLink(metadata)
  );
