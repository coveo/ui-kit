import {AnalyticsClientSendEventHook} from '../client/analytics';
import {EventType} from '../events';

const eventTypesForDefaultValues: string[] = [EventType.click, EventType.custom, EventType.search, EventType.view];

export const addDefaultValues: AnalyticsClientSendEventHook = (eventType, payload) => {
    return eventTypesForDefaultValues.indexOf(eventType) !== -1
        ? {
              language: document.documentElement.lang,
              userAgent: navigator.userAgent,
              ...payload,
          }
        : payload;
};
