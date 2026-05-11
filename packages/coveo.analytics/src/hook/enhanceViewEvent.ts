import {AnalyticsClientSendEventHook} from '../client/analytics';
import {ViewEventRequest, EventType} from '../events';
import {HistoryStore, STORE_KEY} from '../history';

export const enhanceViewEvent: AnalyticsClientSendEventHook = async (eventType, payload) => {
    if (eventType === EventType.view) {
        await addPageViewToHistory(payload.contentIdValue);
        return {
            location: window.location.toString(),
            referrer: document.referrer,
            title: document.title,
            ...payload,
        } as ViewEventRequest;
    }

    return payload;
};

const addPageViewToHistory = async (pageViewValue: string) => {
    const store = new HistoryStore();
    const historyElement = {
        name: 'PageView',
        value: pageViewValue,
        time: new Date().toISOString(),
    };
    await store.addElementAsync(historyElement);
};
