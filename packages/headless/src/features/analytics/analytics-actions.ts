import {
  validatePayload,
  requiredNonEmptyString,
  nonEmptyString,
} from '../../utils/validate-payload';
import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from './analytics-utils';
import {OmniboxSuggestionMetadata} from '../query-suggest/query-suggest-analytics-actions';
import {SearchPageEvents} from 'coveo.analytics';

export interface SearchEventPayload {
  /** The identifier of the search action (e.g., `interfaceLoad`). */
  evt: SearchPageEvents | string;
  /** The event metadata. */
  meta?: Record<string, unknown>;
}

export interface ClickEventPayload {
  evt: SearchPageEvents | string;
  result: Result;
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

export const logSearchEvent = (p: LogSearchEventActionCreatorPayload) =>
  makeAnalyticsAction(
    'analytics/generic/search',
    AnalyticsType.Search,
    (client) => {
      validateEvent(p);
      const {evt, meta} = p;
      return client.logSearchEvent(evt as SearchPageEvents, meta);
    }
  )();

export interface LogClickEventActionCreatorPayload {
  /**
   * The identifier of the click action (e.g., `documentOpen`).
   * */
  evt: string;

  /**
   * The result associated with the click event.
   */
  result: Result;
}

export const logClickEvent = (p: LogClickEventActionCreatorPayload) =>
  makeAnalyticsAction(
    'analytics/generic/click',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(p.result);
      validateEvent(p);

      return client.logClickEvent(
        p.evt as SearchPageEvents,
        partialDocumentInformation(p.result, state),
        documentIdentifier(p.result)
      );
    }
  )();

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

export const logCustomEvent = (p: LogCustomEventActionCreatorPayload) =>
  makeAnalyticsAction(
    'analytics/generic/custom',
    AnalyticsType.Custom,
    (client) => {
      validateEvent(p);
      return client.logCustomEventWithType(p.evt, p.type, p.meta);
    }
  )();

export const logInterfaceLoad = makeAnalyticsAction(
  'analytics/interface/load',
  AnalyticsType.Search,
  (client) => client.logInterfaceLoad()
);

export const logInterfaceChange = makeAnalyticsAction(
  'analytics/interface/change',
  AnalyticsType.Search,
  (client, state) =>
    client.logInterfaceChange({
      interfaceChangeTo: state.configuration.analytics.originLevel2,
    })
);

export const logSearchFromLink = makeAnalyticsAction(
  'analytics/interface/searchFromLink',
  AnalyticsType.Search,
  (client) => client.logSearchFromLink()
);

export const logOmniboxFromLink = (metadata: OmniboxSuggestionMetadata) =>
  makeAnalyticsAction(
    'analytics/interface/omniboxFromLink',
    AnalyticsType.Search,
    (client) => client.logOmniboxFromLink(metadata)
  )();
