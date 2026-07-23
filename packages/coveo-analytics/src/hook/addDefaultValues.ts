import {AnalyticsClientSendEventHook} from '../client/analytics';
import {hasDocument, hasNavigator} from '../detector';
import {EventType} from '../events';

const eventTypesForDefaultValues: string[] = [EventType.click, EventType.custom, EventType.search, EventType.view];

export const addDefaultValues: AnalyticsClientSendEventHook = (eventType, payload) => {
    return eventTypesForDefaultValues.indexOf(eventType) !== -1
        ? {
              language: hasDocument() ? document.documentElement.lang : 'unknown',
              userAgent: hasNavigator() ? navigator.userAgent : 'unknown',
              ...payload,
          }
        : payload;
};
