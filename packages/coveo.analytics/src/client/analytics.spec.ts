import {EventType, ViewEventRequest, DefaultEventResponse} from '../events';
import {CoveoAnalyticsClient} from './analytics';
import {IAnalyticsRequestOptions} from './analyticsRequestClient';
import {CookieAndLocalStorage, CookieStorage, NullStorage} from '../storage';
import HistoryStore from '../history';
import {mockFetch} from '../../tests/fetchMock';
import {BrowserRuntime, NoopRuntime} from './runtimeEnvironment';
import * as doNotTrack from '../donottrack';
import {Cookie} from '../cookieutils';

const aVisitorId = '123';

const uuidv4Mock = jest.fn();
jest.mock('./crypto', () => ({
    uuidv4: () => uuidv4Mock(),
}));

const {fetchMock, fetchMockBeforeEach} = mockFetch();

describe('Analytics', () => {
    const aToken = 'token';
    const anEndpoint = 'http://bloup';
    const A_VERSION = 'v1337';

    const viewEvent: ViewEventRequest = {
        location: 'here',
        contentIdKey: 'key',
        contentIdValue: 'value',
        language: 'en',
    };
    const eventResponse: DefaultEventResponse = {
        visitId: 'firsttimevisiting',
        visitorId: aVisitorId,
    };

    const endpointForEventType = (eventType: EventType, endpoint: string = `${anEndpoint}/rest`) =>
        `${endpoint}/${A_VERSION}/analytics/${eventType}?visitor=${aVisitorId}`;
    const mockFetchRequestForEventType = (eventType: EventType) => {
        const address = endpointForEventType(eventType);
        fetchMock.post(address, eventResponse);
    };

    let client: CoveoAnalyticsClient;

    beforeEach(() => {
        jest.resetAllMocks();
        fetchMockBeforeEach();

        new CookieStorage().removeItem('visitorId');
        localStorage.clear();
        fetchMock.reset();
        uuidv4Mock.mockImplementationOnce(() => aVisitorId);

        client = new CoveoAnalyticsClient({
            token: aToken,
            endpoint: anEndpoint,
            version: A_VERSION,
        });
    });

    it('should call fetch with the parameters', async () => {
        mockFetchRequestForEventType(EventType.view);

        const response = await client.sendViewEvent(viewEvent);
        expect(response).toEqual(eventResponse);

        expect(fetchMock.called()).toBe(true);

        const [path, {headers, body}] = fetchMock.lastCall();
        expect(path).toBe(endpointForEventType(EventType.view));

        const h = headers as Record<string, string>;
        expect(h['Authorization']).toBe(`Bearer ${aToken}`);
        expect(h['Content-Type']).toBe('application/json');

        expect(body).not.toBeUndefined();

        const parsedBody = JSON.parse(body.toString());
        expect(parsedBody).toMatchObject(viewEvent);
    });

    it('should append default values to the view event', async () => {
        mockFetchRequestForEventType(EventType.view);

        await client.sendViewEvent(viewEvent);

        const [body] = getParsedBodyCalls();

        expect(body).toMatchObject({
            language: 'en',
            userAgent: navigator.userAgent,
        });
    });

    it('should send the events in the order they were called', async () => {
        mockFetchRequestForEventType(EventType.view);
        const firstRequest = client.sendViewEvent({
            ...viewEvent,
            customData: {
                index: 0,
            },
        });
        const secondRequest = client.sendViewEvent({
            ...viewEvent,
            customData: {
                index: 1,
            },
        });
        const thirdRequest = client.sendViewEvent({
            ...viewEvent,
            customData: {
                index: 2,
            },
        });

        await Promise.all([firstRequest, secondRequest, thirdRequest]);

        const assertResponseHasCustomDataWithIndex = (response: RequestInit, index: number) => {
            const parsedBody = JSON.parse(response.body.toString());
            expect(parsedBody.customData.index).toBe(index);
        };
        const [[, firstResponse], [, secondResponse], [, thirdResponse]] = fetchMock.calls();
        assertResponseHasCustomDataWithIndex(firstResponse, 0);
        assertResponseHasCustomDataWithIndex(secondResponse, 1);
        assertResponseHasCustomDataWithIndex(thirdResponse, 2);
    });

    it('should should only clean null, undefined, and empty string values', async () => {
        mockFetchRequestForEventType(EventType.view);
        await client.sendEvent(EventType.view, {
            fine: 1,
            ok: 0,
            notok: '',
            invalid: null,
            ohno: undefined,
        });

        const [body] = getParsedBodyCalls();

        expect(body).toMatchObject({
            fine: 1,
            ok: 0,
        });
    });

    it('should not remove #queryText for search events even if empty', async () => {
        mockFetchRequestForEventType(EventType.search);
        await client.sendEvent(EventType.search, {
            queryText: '',
        });

        const [body] = getParsedBodyCalls();

        expect(body).toMatchObject({
            queryText: '',
        });
    });

    describe('with event type mapping with variable arguments', () => {
        const specialEventType = '🌟special🌟';
        const argumentNames = ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'];
        beforeEach(() => {
            mockFetchRequestForEventType(EventType.custom);
            client.addEventTypeMapping(specialEventType, {
                newEventType: EventType.custom,
                variableLengthArgumentsNames: argumentNames,
            });
        });

        it('should properly parse empty arguments', async () => {
            await client.sendEvent(specialEventType);

            const [path, {body}] = fetchMock.lastCall();
            expect(path).toBe(endpointForEventType(EventType.custom));

            const parsedBody = JSON.parse(body.toString());
            expect(parsedBody).toEqual({});
        });

        it('should properly parse 1 argument', async () => {
            await client.sendEvent(specialEventType, 'Video');

            const [body] = getParsedBodyCalls();

            expect(body).toEqual({
                [argumentNames[0]]: 'Video',
            });
        });

        it('should properly parse all arguments', async () => {
            await client.sendEvent(specialEventType, 'Video', 'play', 'campaign');

            const [body] = getParsedBodyCalls();

            expect(body).toEqual({
                [argumentNames[0]]: 'Video',
                [argumentNames[1]]: 'play',
                [argumentNames[2]]: 'campaign',
            });
        });

        it('should properly handle a finished object argument', async () => {
            await client.sendEvent(specialEventType, 'Video', {
                nonInteraction: true,
            });

            const [body] = getParsedBodyCalls();

            expect(body).toEqual({
                [argumentNames[0]]: 'Video',
                nonInteraction: true,
            });
        });
    });

    describe('with event type mapping activating context values', () => {
        const specialEventType = '🌟special🌟';
        beforeEach(() => {
            mockFetchRequestForEventType(EventType.custom);
            client.addEventTypeMapping(specialEventType, {
                newEventType: EventType.custom,
                addVisitorIdParameter: true,
            });
        });

        it('should properly add visitorId key', async () => {
            await client.sendEvent(specialEventType);

            const [body] = getParsedBodyCalls();

            expect(body).toHaveProperty('visitorId');
        });
    });

    describe('with an endpoint set to the coveo platform proxy', () => {
        const endpointWithRest = 'http://someendpoint.cloud.coveo.com/rest/ua';
        beforeEach(() => {
            client = new CoveoAnalyticsClient({
                token: aToken,
                endpoint: endpointWithRest,
                version: A_VERSION,
            });

            fetchMock.post(endpointForEventType(EventType.custom, endpointWithRest), eventResponse);
        });

        it('should properly send the event without appending an extra /rest', async () => {
            const response = await client.sendEvent(EventType.custom);
            expect(response).toEqual(eventResponse);
        });
    });

    describe('with userId auto-detection', () => {
        const eventType = '🛂';

        const expectUserId = (userId: {[key: string]: string}) => {
            const [body] = getParsedBodyCalls();
            expect(body).toMatchObject(userId);
        };

        describe('for API keys', () => {
            beforeEach(() => {
                client = new CoveoAnalyticsClient({
                    token: 'xxapikey',
                    endpoint: anEndpoint,
                    version: A_VERSION,
                });
                mockFetchRequestForEventType(EventType.custom);
            });
            describe('with measurement protocol', () => {
                beforeEach(() => {
                    client.addEventTypeMapping(eventType, {
                        newEventType: EventType.custom,
                        usesMeasurementProtocol: true,
                    });
                });

                it('should set the absent userId to anonymous', async () => {
                    await client.sendEvent(eventType);
                    expectUserId({uid: 'anonymous'});
                });

                it('should leave existing userIds', async () => {
                    await client.sendEvent(eventType, {userId: 'bob'});
                    expectUserId({uid: 'bob'});
                });
            });

            describe('without measurement protocol', () => {
                beforeEach(() => {
                    client.addEventTypeMapping(eventType, {
                        newEventType: EventType.custom,
                        usesMeasurementProtocol: false,
                    });
                });

                it('should do nothing with absent userId', async () => {
                    await client.sendEvent(eventType);
                    expectUserId({});
                });

                it('should leave existing userIds', async () => {
                    await client.sendEvent(eventType, {userId: 'bob'});
                    expectUserId({userId: 'bob'});
                });
            });
        });

        describe('for OAuth Tokens', () => {
            beforeEach(() => {
                client = new CoveoAnalyticsClient({
                    token: 'xtoken',
                    endpoint: anEndpoint,
                    version: A_VERSION,
                });
                mockFetchRequestForEventType(EventType.custom);
                client.addEventTypeMapping(eventType, {
                    newEventType: EventType.custom,
                    usesMeasurementProtocol: true,
                });
            });

            it('should do nothing with absent userId', async () => {
                await client.sendEvent(eventType);
                expectUserId({});
            });

            it('should leave existing userIds', async () => {
                await client.sendEvent(eventType, {userId: 'bob'});
                expectUserId({uid: 'bob'});
            });
        });
    });

    it('should support clearing cookies for visitorId and historyStore', () => {
        const visitorId = 'foo';
        const history = {name: 'foo', time: '123', value: 'bar'};
        const storage = new CookieStorage();
        const historyStore = new HistoryStore();

        client.currentVisitorId = visitorId;
        historyStore.addElement(history);

        expect(storage.getItem('visitorId')).toBe('foo');
        expect(historyStore.getMostRecentElement()).toEqual(history);

        client.clear();
        expect(storage.getItem('visitorId')).toBeNull();
        expect(historyStore.getMostRecentElement()).toBeUndefined();
    });

    it('should support clearing cookies for visitorId and historyStore async', async () => {
        const visitorId = 'foo';
        const history = {name: 'foo', time: '123', value: 'bar'};
        const storage = new CookieStorage();
        const historyStore = new HistoryStore();

        await client.setCurrentVisitorId(visitorId);
        await historyStore.addElementAsync(history);

        expect(await storage.getItem('visitorId')).toBe('foo');
        expect(historyStore.getMostRecentElement()).toEqual(history);

        client.clear();
        expect(storage.getItem('visitorId')).toBeNull();
        expect(historyStore.getMostRecentElement()).toBeUndefined();
    });

    it('should execute before send hooks passed as option', async () => {
        mockFetchRequestForEventType(EventType.search);
        const spy = jest.fn((_, p) => p);
        const searchEventPayload = {queryText: 'potato'};
        await new CoveoAnalyticsClient({
            token: aToken,
            endpoint: anEndpoint,
            version: A_VERSION,
            beforeSendHooks: [spy],
        }).sendEvent(EventType.search, searchEventPayload);
        expect(spy).toHaveBeenLastCalledWith(EventType.search, expect.objectContaining(searchEventPayload));
    });

    it('should preprocess the request with the preprocessRequest', async () => {
        let clientOrigin: string;
        let processedRequest: IAnalyticsRequestOptions = {
            url: 'https://www.myownanalytics.com/endpoint',
            headers: {
                Age: '24',
            },
            method: 'PUT',
            body: JSON.stringify({
                test: 'custom',
            }),
        };
        fetchMock.put(processedRequest.url, eventResponse);
        const searchEventPayload = {queryText: 'potato'};
        await new CoveoAnalyticsClient({
            token: aToken,
            endpoint: anEndpoint,
            version: A_VERSION,
            preprocessRequest: (request, type) => {
                clientOrigin = type;
                processedRequest = {
                    ...request,
                    ...processedRequest,
                };
                return processedRequest;
            },
        }).sendEvent(EventType.search, searchEventPayload);

        const call = fetchMock.calls()[0];
        const url = call[0];
        const options: RequestInit = call[1];

        const {url: expectedUrl, ...expectedOptions} = processedRequest;
        expect(clientOrigin).toBe('analyticsFetch');
        expect(url).toBe(expectedUrl);
        expect(options).toEqual(expectedOptions);
    });

    const getParsedBodyCalls = (): any[] => {
        return fetchMock.calls().map(([, {body}]) => {
            return JSON.parse(body.toString());
        });
    };
});

describe('doNotTrack', () => {
    it('should do business as usual if doNotTrack returns false', () => {
        jest.spyOn(doNotTrack, 'doNotTrack').mockImplementation(() => false);

        let client = new CoveoAnalyticsClient({});

        expect(client.runtime).toBeInstanceOf(BrowserRuntime);
        expect(client.runtime.storage).toBeInstanceOf(CookieAndLocalStorage);
    });

    it('should honor doNotTrack', () => {
        jest.spyOn(doNotTrack, 'doNotTrack').mockImplementation(() => true);

        let client = new CoveoAnalyticsClient({});

        expect(client.runtime).toBeInstanceOf(BrowserRuntime);
        expect(client.runtime.storage).toBeInstanceOf(NullStorage);
    });

    it('should clear existing cookies', async () => {
        jest.spyOn(doNotTrack, 'doNotTrack').mockImplementation(() => true);
        Cookie.set('coveo_visitorId', aVisitorId);
        expect(Cookie.get('coveo_visitorId')).toBe(aVisitorId);

        new CoveoAnalyticsClient({});

        expect(Cookie.get('coveo_visitorId')).not.toBe(aVisitorId);
    });
});
