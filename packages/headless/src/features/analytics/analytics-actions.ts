import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state';
import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from './analytics-utils';

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
    type: new StringValue({required: false, emptyAllowed: false}),
  });

/**
 * Logs a search event.
 * @param p (SearchEventPayload) The search event payload.
 */
export const logSearchEvent = (p: SearchEventPayload) =>
  makeAnalyticsAction(
    'analytics/generic/search',
    AnalyticsType.Search,
    (client) => {
      validateEvent(p);
      const {evt, meta} = p;
      return client.logSearchEvent(evt as SearchPageEvents, meta);
    }
  )();

/**
 * Logs a click event.
 * @param p (ClickEventPayload) The click event payload.
 */
export const logClickEvent = (p: ClickEventPayload) =>
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

/**
 * Logs a custom event.
 * @param p (CustomEventPayload) The custom event payload.
 */
export const logCustomEvent = (p: CustomEventPayload) =>
  makeAnalyticsAction(
    'analytics/generic/custom',
    AnalyticsType.Custom,
    (client) => {
      validateEvent(p);
      return client.logCustomEventWithType(p.evt, p.type, p.meta);
    }
  )();

/**
 * Logs an interface load event.
 */
export const logInterfaceLoad = makeAnalyticsAction(
  'analytics/interface/load',
  AnalyticsType.Search,
  (client) => client.logInterfaceLoad()
);

/**
 * Logs an interface change event.
 */
export const logInterfaceChange = makeAnalyticsAction(
  'analytics/interface/change',
  AnalyticsType.Search,
  (client, state) =>
    client.logInterfaceChange({
      interfaceChangeTo:
        state.advancedSearchQueries?.cq ||
        getAdvancedSearchQueriesInitialState().cq,
    })
);
