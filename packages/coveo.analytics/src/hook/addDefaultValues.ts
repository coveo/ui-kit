import { AnalyticsClientSendEventHook } from '../client/analytics';

export const addDefaultValues: AnalyticsClientSendEventHook = (eventType, payload) => {
    return {
        language: document.documentElement.lang,
        userAgent: navigator.userAgent,
        ...payload
    };
};
