import {
    ClickEventRequest,
    CustomEventRequest,
    DefaultEventResponse,
    EventType,
    SearchEventRequest,
    ViewEventRequest,
} from '../events';
import {CoveoAnalyticsClient} from './analytics';
import {IAnalyticsRequestOptions} from './analyticsRequestClient';
import {CookieAndLocalStorage, CookieStorage, NullStorage} from '../storage';
import HistoryStore from '../history';
import {mockFetch} from '../../tests/fetchMock';
import {BrowserRuntime, NoopRuntime} from './runtimeEnvironment';
import * as doNotTrack from '../donottrack';
import {Cookie} from '../cookieutils';
import {CoveoLinkParam} from '../plugins/link';
import {NoopAnalytics} from './noopAnalytics';

const aVisitorId = '123';
jest.mock('uuid', () => ({
    v4: () => aVisitorId,
    validate: jest.requireActual('uuid').validate,
    v5: jest.requireActual('uuid').v5,
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
    const searchEvent: SearchEventRequest = {
        searchQueryUid: 'sqUid',
        actionCause: 'interfaceLoad',
        queryText: 'test',
        responseTime: 50,
    };
    const clickEvent: ClickEventRequest = {
        searchQueryUid: 'sqUid',
        actionCause: 'documentOpen',
        documentPosition: 1,
        documentUriHash: 'docUriHash',
        sourceName: 'source',
    };
    const customEvent: CustomEventRequest = {
        eventType: 'custom',
        eventValue: 'value',
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

        client = new CoveoAnalyticsClient({
            token: aToken,
            endpoint: anEndpoint,
            version: A_VERSION,
        });
    });

    it('should add /rest if not present in endpoint', async () => {
        const legacyEndpoint = 'https://usageanalytics.com';

        client = new CoveoAnalyticsClient({
            token: aToken,
            endpoint: legacyEndpoint,
            version: A_VERSION,
        });

        fetchMock.post(endpointForEventType(EventType.custom, `${legacyEndpoint}/rest`), eventResponse);
        const response = await client.sendEvent(EventType.custom);
        expect(response).toEqual(eventResponse);
    });

    it('should not add /rest if /rest present in endpoint', async () => {
        const legacyEndpoint = 'https://usageanalytics.com/rest';

        client = new CoveoAnalyticsClient({
            token: aToken,
            endpoint: legacyEndpoint,
            version: A_VERSION,
        });

        fetchMock.post(endpointForEventType(EventType.custom, legacyEndpoint), eventResponse);
        const response = await client.sendEvent(EventType.custom);
        expect(response).toEqual(eventResponse);
    });

    it('should not add /rest if /rest/ua present in endpoint', async () => {
        const legacyEndpoint = 'https://usageanalytics.com/rest/ua';

        client = new CoveoAnalyticsClient({
            token: aToken,
            endpoint: legacyEndpoint,
            version: A_VERSION,
        });

        fetchMock.post(endpointForEventType(EventType.custom, legacyEndpoint), eventResponse);
        const response = await client.sendEvent(EventType.custom);
        expect(response).toEqual(eventResponse);
    });

    it('should remove trailing slash in endpoint', async () => {
        const legacyEndpoint = 'https://usageanalytics.com';

        client = new CoveoAnalyticsClient({
            token: aToken,
            endpoint: legacyEndpoint + '/',
            version: A_VERSION,
        });

        fetchMock.post(endpointForEventType(EventType.custom, `${legacyEndpoint}/rest`), eventResponse);
        const response = await client.sendEvent(EventType.custom);
        expect(response).toEqual(eventResponse);
    });

    it('should allow reverse-proxy endpoint', async () => {
        const aReverseProxyEndpoint = 'https://12364734.cloudfront.net/analytics';

        client = new CoveoAnalyticsClient({
            token: aToken,
            endpoint: aReverseProxyEndpoint,
            isCustomEndpoint: true,
            version: A_VERSION,
        });

        fetchMock.post(endpointForEventType(EventType.custom, aReverseProxyEndpoint), eventResponse);
        const response = await client.sendEvent(EventType.custom);
        expect(response).toEqual(eventResponse);
    });

    it('should call fetch with the parameters', async () => {
        mockFetchRequestForEventType(EventType.view);

        const response = await client.sendViewEvent(viewEvent);
        expect(response).toEqual(eventResponse);

        expect(fetchMock.called()).toBe(true);

        const [path, {headers, body}]: any = fetchMock.lastCall();
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
            clientId: '123',
            userAgent: navigator.userAgent,
        });
    });

    it('should append default values to the search event', async () => {
        mockFetchRequestForEventType(EventType.search);

        await client.sendSearchEvent(searchEvent);

        const [body] = getParsedBodyCalls();

        expect(body).toMatchObject({
            clientId: '123',
            userAgent: navigator.userAgent,
        });
    });

    it('should append default values to the click event', async () => {
        mockFetchRequestForEventType(EventType.click);

        await client.sendClickEvent(clickEvent);

        const [body] = getParsedBodyCalls();

        expect(body).toMatchObject({
            clientId: '123',
            userAgent: navigator.userAgent,
        });
    });

    it('should append default values to the custom event', async () => {
        mockFetchRequestForEventType(EventType.custom);

        await client.sendCustomEvent(customEvent);

        const [body] = getParsedBodyCalls();

        expect(body).toMatchObject({
            clientId: '123',
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

        const assertResponseHasCustomDataWithIndex = (response: RequestInit | undefined, index: number) => {
            const parsedBody = JSON.parse(response!.body!.toString());
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

    describe('should truncate the maxlength for URL parameters at 128 characters for ua events', () => {
        const desiredMax: number = 128;
        const longUrl: string = 'http://coveo.com/?q=' + 'a'.repeat(desiredMax);
        expect(longUrl.length).toBeGreaterThan(desiredMax);
        async function testEventType(type: EventType, url: string) {
            mockFetchRequestForEventType(type);
            await client.sendEvent(type, {
                location: type == EventType.view ? url : undefined,
                originLevel3: url,
            });
            const [body] = getParsedBodyCalls();
            if (type == EventType.view) expect(body.location.length).toBeLessThanOrEqual(desiredMax);
            expect(body.originLevel3.length).toBeLessThanOrEqual(desiredMax);
        }
        it('for view events', () => testEventType(EventType.view, longUrl));
        it('for click events', () => testEventType(EventType.click, longUrl));
        it('for search events', () => testEventType(EventType.search, longUrl));
        it('for custom events', () => testEventType(EventType.custom, longUrl));
    });

    describe('url truncation is null safe', () => {
        async function testAttributeTruncation(url: any) {
            mockFetchRequestForEventType(EventType.view);
            await client.sendEvent(EventType.view, {
                location: url,
                originLevel3: url,
            });
            const [body] = getParsedBodyCalls();
            expect(body.location).toBe(url == null ? undefined : url);
            expect(body.originLevel3).toBe(url == null ? undefined : url);
        }
        it('for undefined urls', () => testAttributeTruncation(undefined));
        it('for null urls', () => testAttributeTruncation(null));
        it('for non-string urls', () => testAttributeTruncation(12345));
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

            const [path, {body}]: any = fetchMock.lastCall();
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

    describe('with context_website is set in customData', () => {
        const contextWebsite = 'yourbestfriend.com';
        const trackingId = 'yourfavoritefood.ca ';
        beforeEach(() => {
            client = new CoveoAnalyticsClient({
                token: 'xtoken',
                endpoint: anEndpoint,
                version: A_VERSION,
            });
            mockFetchRequestForEventType(EventType.view);
        });

        it('should set trackingId when trackingId is not specified', async () => {
            await client.sendEvent(EventType.view, {customData: {context_website: contextWebsite}});
            const [body] = getParsedBodyCalls();
            expect(body.trackingId).toBe(contextWebsite);
        });

        it('should not overwrite trackingId when trackingId is specified', async () => {
            await client.sendEvent(EventType.view, {
                trackingId: trackingId,
                customData: {context_website: contextWebsite},
            });
            const [body] = getParsedBodyCalls();
            expect(body.trackingId).toBe(trackingId);
        });
    });

    describe('with siteName is set in customData', () => {
        const website = 'yourbestfriend.com';
        const trackingId = 'yourfavoritefood.ca ';
        beforeEach(() => {
            client = new CoveoAnalyticsClient({
                token: 'xtoken',
                endpoint: anEndpoint,
                version: A_VERSION,
            });
            mockFetchRequestForEventType(EventType.view);
        });

        it('should set trackingId when trackingId is not specified', async () => {
            await client.sendEvent(EventType.view, {customData: {siteName: website}});
            const [body] = getParsedBodyCalls();
            expect(body.trackingId).toBe(website);
        });

        it('should not overwrite trackingId when trackingId is specified', async () => {
            await client.sendEvent(EventType.view, {trackingId: trackingId, customData: {siteName: website}});
            const [body] = getParsedBodyCalls();
            expect(body.trackingId).toBe(trackingId);
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
        const options: RequestInit | undefined = call[1];

        const {url: expectedUrl, ...expectedOptions} = processedRequest;
        expect(clientOrigin!).toBe('analyticsFetch');
        expect(url).toBe(expectedUrl);
        expect(options).toEqual(expectedOptions);
    });

    const getParsedBodyCalls = (): any[] => {
        return fetchMock.calls().map(([, {body}]: any) => {
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

        expect(client.runtime).toBeInstanceOf(NoopRuntime);
        expect(client.runtime.storage).toBeInstanceOf(NullStorage);
    });

    it('should not clear existing cookies', async () => {
        jest.spyOn(doNotTrack, 'doNotTrack').mockImplementation(() => true);
        Cookie.set('coveo_visitorId', aVisitorId);
        expect(Cookie.get('coveo_visitorId')).toBe(aVisitorId);

        new CoveoAnalyticsClient({});

        expect(Cookie.get('coveo_visitorId')).toBe(aVisitorId);
    });
});

describe('custom clientId', () => {
    it('allows setting of a custom clientId', async () => {
        const client = new CoveoAnalyticsClient({});
        client.setClientId('c7d57b22-4aa8-487a-a106-be5243885f0a');
        expect(await client.getCurrentVisitorId()).toBe('c7d57b22-4aa8-487a-a106-be5243885f0a');
    });

    it('persists clientId in lowercase', async () => {
        const client = new CoveoAnalyticsClient({});
        client.setClientId('C7D57B22-4AA8-487A-A106-BE5243885F0A');
        expect(await client.getCurrentVisitorId()).toBe('c7d57b22-4aa8-487a-a106-be5243885f0a');
    });

    it('allows setting a custom consistent clientId given a string', async () => {
        const client = new CoveoAnalyticsClient({});
        client.setClientId('somestring', 'testNameSpace');
        //uuid v5 specific uuid generation
        expect(await client.getCurrentVisitorId()).toBe('2c356915-8223-5773-acb8-e2a34404a559');
        //check for consistent ids
        client.setClientId('somestring', 'testNameSpace');
        expect(await client.getCurrentVisitorId()).toBe('2c356915-8223-5773-acb8-e2a34404a559');
        client.setClientId('otherstring', 'testNameSpace');
        expect(await client.getCurrentVisitorId()).not.toBe('2c356915-8223-5773-acb8-e2a34404a559');
        client.setClientId('somestring', 'otherNameSpace');
        expect(await client.getCurrentVisitorId()).not.toBe('2c356915-8223-5773-acb8-e2a34404a559');
    });

    it('errors when not providing a namespace', async () => {
        const client = new CoveoAnalyticsClient({});
        expect.assertions(1);
        await expect(client.setClientId('somestring')).rejects.toEqual(
            Error('Cannot generate uuid client id without a specific namespace string.')
        );
        //uuid v5 specific uuid generation
    });
});

describe('clientId from link', () => {
    // note: referrer is set as http://somewhere.over/thereferrer in setup.js
    let client: CoveoAnalyticsClient;
    const forcedUUID: string = 'c0b48880-743e-484f-8044-d7c37910c55b';

    function navigateTo(url: string) {
        // @ts-ignore
        delete window.location;
        // @ts-ignore
        window.location = new URL(url);
    }

    beforeEach(() => {
        client = new CoveoAnalyticsClient({});
        // need to clear existing clientIds
        client.clear();
        jest.spyOn(doNotTrack, 'doNotTrack').mockImplementation(() => false);
    });

    it('will extract a clientId from a query param if the referrer matches all and it is not expired', async () => {
        client.setAcceptedLinkReferrers(['*']);
        const linkString = new CoveoLinkParam(forcedUUID, Date.now());
        navigateTo('http://my.receivingdomain.com/?cvo_cid=' + linkString.toString());
        expect(await client.getCurrentVisitorId()).toBe(forcedUUID);
    });

    it('will extract a clientId from a query param if the referrer matches the current referrer exactly and it is not expired', async () => {
        client.setAcceptedLinkReferrers(['somewhere.over']);
        const linkString = new CoveoLinkParam(forcedUUID, Date.now());
        navigateTo('http://my.receivingdomain.com/?cvo_cid=' + linkString.toString());
        expect(await client.getCurrentVisitorId()).toBe(forcedUUID);
    });

    it('will extract a clientId from a query param if the referrer matches the current referrer with wildcard and it is not expired', async () => {
        client.setAcceptedLinkReferrers(['*.over']);
        const linkString = new CoveoLinkParam(forcedUUID, Date.now());
        navigateTo('http://my.receivingdomain.com/?cvo_cid=' + linkString.toString());
        expect(await client.getCurrentVisitorId()).toBe(forcedUUID);
    });

    it('will extract a clientId from a query param if one of the referrer matches the current referrer and it is not expired', async () => {
        client.setAcceptedLinkReferrers(['*.mydomain.com', '*.over']);
        const linkString = new CoveoLinkParam(forcedUUID, Date.now());
        navigateTo('http://my.receivingdomain.com/?cvo_cid=' + linkString.toString());
        expect(await client.getCurrentVisitorId()).toBe(forcedUUID);
    });

    it('will not extract a clientId from a query param if the referrer matches and it is expired', async () => {
        client.setAcceptedLinkReferrers(['*']);
        const linkString = new CoveoLinkParam(forcedUUID, Date.now() - 180000);
        navigateTo('http://my.receivingdomain.com/?cvo_cid=' + linkString.toString());
        expect(await client.getCurrentVisitorId()).not.toBe(null);
        expect(await client.getCurrentVisitorId()).toBe(aVisitorId);
    });

    it('will not extract a clientId from a query param if there is no accept list specified', async () => {
        const linkString = new CoveoLinkParam(forcedUUID, Date.now());
        navigateTo('http://my.receivingdomain.com/?cvo_cid=' + linkString.toString());
        expect(await client.getCurrentVisitorId()).not.toBe(null);
        expect(await client.getCurrentVisitorId()).toBe(aVisitorId);
    });

    it('will not extract a clientId from a query param if there is an empty accept list', async () => {
        client.setAcceptedLinkReferrers([]);
        const linkString = new CoveoLinkParam(forcedUUID, Date.now());
        navigateTo('http://my.receivingdomain.com/?cvo_cid=' + linkString.toString());
        expect(await client.getCurrentVisitorId()).not.toBe(null);
        expect(await client.getCurrentVisitorId()).toBe(aVisitorId);
    });

    it('will not extract a clientId from a query param if the referrer list does not match', async () => {
        client.setAcceptedLinkReferrers(['*.mydomain.com']);
        const linkString = new CoveoLinkParam(forcedUUID, Date.now());
        navigateTo('http://my.receivingdomain.com/?cvo_cid=' + linkString.toString());
        expect(await client.getCurrentVisitorId()).not.toBe(null);
        expect(await client.getCurrentVisitorId()).toBe(aVisitorId);
    });

    it('will not extract a clientId from a query param if the referrer list does not match the exact port', async () => {
        client.setAcceptedLinkReferrers(['*.over:9000']);
        const linkString = new CoveoLinkParam(forcedUUID, Date.now());
        navigateTo('http://my.receivingdomain.com/?cvo_cid=' + linkString.toString());
        expect(await client.getCurrentVisitorId()).not.toBe(null);
        expect(await client.getCurrentVisitorId()).toBe(aVisitorId);
    });

    it('will not extract a clientId from a query param if the multi referrer list does not match', async () => {
        client.setAcceptedLinkReferrers(['*.mydomain.com', 'www.example.com']);
        const linkString = new CoveoLinkParam(forcedUUID, Date.now());
        navigateTo('http://my.receivingdomain.com/?cvo_cid=' + linkString.toString());
        expect(await client.getCurrentVisitorId()).not.toBe(null);
        expect(await client.getCurrentVisitorId()).toBe(aVisitorId);
    });

    it('will not extract a clientId from a query param if it is not a UUID', async () => {
        client.setAcceptedLinkReferrers(['*']);
        navigateTo('http://my.receivingdomain.com/?cvo_cid=notauuid.' + Math.floor(Date.now() / 1000));
        expect(await client.getCurrentVisitorId()).not.toBe(null);
        expect(await client.getCurrentVisitorId()).toBe(aVisitorId);
    });

    it('will not extract a clientId from a query param if DNT is enabled', async () => {
        client.setAcceptedLinkReferrers(['*']);
        jest.spyOn(doNotTrack, 'doNotTrack').mockImplementation(() => true);
        const linkString = new CoveoLinkParam(forcedUUID, Date.now());
        navigateTo('http://my.receivingdomain.com/?cvo_cid=' + linkString.toString());
        expect(await client.getCurrentVisitorId()).not.toBe(null);
        expect(await client.getCurrentVisitorId()).toBe(aVisitorId);
    });

    it('will throw when specifying invalid hosts list', async () => {
        //@ts-ignore
        expect(() => client.setAcceptedLinkReferrers('*')).toThrow('Parameter should be an array of domain strings');
        //@ts-ignore
        expect(() => client.setAcceptedLinkReferrers({})).toThrow('Parameter should be an array of domain strings');
        //@ts-ignore
        expect(() => client.setAcceptedLinkReferrers([{}])).toThrow('Parameter should be an array of domain strings');
    });
});
