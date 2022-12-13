import {AnalyticsClient, PreparedEvent} from '../src/client/analytics';
import {NoopAnalytics} from '../src/client/noopAnalytics';
import {NoopRuntime} from '../src/client/runtimeEnvironment';
import {AnyEventResponse, EventType} from '../src/events';

export const visitorIdMock = 'mockvisitorid';

const makeEvent = (eventType: EventType | string) =>
    Promise.resolve({eventType: eventType as EventType, payload: null, log: () => Promise.resolve()});

export const createAnalyticsClientMock = (): jest.Mocked<AnalyticsClient> => ({
    getPayload: jest.fn((eventType, ...payload) => Promise.resolve()),
    getParameters: jest.fn((eventType, ...payload) => Promise.resolve()),
    makeEvent: jest.fn(makeEvent),
    sendEvent: jest.fn((eventType, payload) => Promise.resolve()),
    makeClickEvent: jest.fn((request) => makeEvent(EventType.click)),
    sendClickEvent: jest.fn((request) => Promise.resolve()),
    makeCustomEvent: jest.fn((request) => makeEvent(EventType.custom)),
    sendCustomEvent: jest.fn((request) => Promise.resolve()),
    makeSearchEvent: jest.fn((request) => makeEvent(EventType.search)),
    sendSearchEvent: jest.fn((request) => Promise.resolve()),
    makeViewEvent: jest.fn((request) => makeEvent(EventType.view)),
    sendViewEvent: jest.fn((request) => Promise.resolve()),
    getHealth: jest.fn(() => Promise.resolve({status: 'ok'})),
    getVisit: jest.fn(() => Promise.resolve({id: 'a', visitorId: 'ok'})),
    addEventTypeMapping: jest.fn(),
    registerBeforeSendEventHook: jest.fn(),
    registerAfterSendEventHook: jest.fn(),
    runtime: new NoopRuntime(),
    currentVisitorId: '',
    getCurrentVisitorId: jest.fn(() => Promise.resolve(visitorIdMock)),
});
