import type {Mocked} from 'vitest';
import {AnalyticsClient, PreparedEvent} from '../src/client/analytics';
import {NoopAnalytics} from '../src/client/noopAnalytics';
import {NoopRuntime} from '../src/client/runtimeEnvironment';
import {AnyEventResponse, EventType} from '../src/events';

export const visitorIdMock = 'mockvisitorid';

const makeEvent = (eventType: EventType | string) =>
  Promise.resolve({
    eventType: eventType as EventType,
    payload: null,
    log: () => Promise.resolve(),
  });

export const createAnalyticsClientMock = (): Mocked<AnalyticsClient> => ({
  getPayload: vi.fn((eventType, ...payload) => Promise.resolve()) as any,
  getParameters: vi.fn((eventType, ...payload) => Promise.resolve()) as any,
  makeEvent: vi.fn(makeEvent) as any,
  sendEvent: vi.fn((eventType, payload) => Promise.resolve()) as any,
  makeClickEvent: vi.fn((request) => makeEvent(EventType.click)),
  sendClickEvent: vi.fn((request) => Promise.resolve()),
  makeCustomEvent: vi.fn((request) => makeEvent(EventType.custom)),
  sendCustomEvent: vi.fn((request) => Promise.resolve()),
  makeSearchEvent: vi.fn((request) => makeEvent(EventType.search)),
  sendSearchEvent: vi.fn((request) => Promise.resolve()),
  makeViewEvent: vi.fn((request) => makeEvent(EventType.view)),
  sendViewEvent: vi.fn((request) => Promise.resolve()),
  getHealth: vi.fn(() => Promise.resolve({status: 'ok'})),
  getVisit: vi.fn(() => Promise.resolve({id: 'a', visitorId: 'ok'})),
  addEventTypeMapping: vi.fn(),
  registerBeforeSendEventHook: vi.fn(),
  registerAfterSendEventHook: vi.fn(),
  runtime: new NoopRuntime(),
  currentVisitorId: '',
  getCurrentVisitorId: vi.fn(() => Promise.resolve(visitorIdMock)),
  version: 'mock',
});
