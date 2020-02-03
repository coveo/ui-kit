import { AnalyticsClientSendEventHook } from '../client/analytics';
import { ViewEventRequest } from '../events';

export const enhanceViewEvent: AnalyticsClientSendEventHook = (
    eventType,
    payload
) => {
    return eventType === 'view'
        ? ({
              location: window.location.toString(),
              referrer: document.referrer,
              title: document.title,
              ...payload
          } as ViewEventRequest)
        : payload;
};
