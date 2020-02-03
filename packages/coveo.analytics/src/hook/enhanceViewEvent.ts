import { AnalyticsClientSendEventHook } from '../client/analytics';
import { ViewEventRequest, EventType } from '../events';

export const enhanceViewEvent: AnalyticsClientSendEventHook = (
    eventType,
    payload
) => {
    return eventType === EventType.view
        ? ({
              location: window.location.toString(),
              referrer: document.referrer,
              title: document.title,
              ...payload
          } as ViewEventRequest)
        : payload;
};
