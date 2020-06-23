import {AnalyticsClientSendEventHook} from '../client/analytics';
import {ViewEventRequest, EventType} from '../events';
import {HistoryStore, STORE_KEY} from '../history';

export const enhanceViewEvent: AnalyticsClientSendEventHook = (eventType, payload) => {
    if (eventType === EventType.view) {
        addPageViewToHistory(payload.contentIdValue);
        return {
            location: window.location.toString(),
            referrer: document.referrer,
            title: document.title,
            ...payload,
        } as ViewEventRequest;
    }

    return payload;
};

const addPageViewToHistory = (pageViewValue: string) => {
    const store = new HistoryStore();
    const historyElement = {
        name: 'PageView',
        value: pageViewValue,
        time: JSON.stringify(new Date()),
    };
    store.addElement(historyElement);
};
