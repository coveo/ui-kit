import * as fetchMock from 'fetch-mock';
import {EventType, ViewEventRequest, DefaultEventResponse} from '../events';
import {CoveoAnalyticsClient} from './analytics';
import {CookieStorage} from '../storage';

const aVisitorId = '123';

const uuidv4Mock = jest.fn();
jest.mock('./crypto', () => ({
    uuidv4: () => uuidv4Mock(),
}));

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

    const endpointForEventType = (eventType: EventType) =>
        `${anEndpoint}/rest/${A_VERSION}/analytics/${eventType}?visitor=${aVisitorId}`;
    const mockFetchRequestForEventType = (eventType: EventType) => {
        const address = endpointForEventType(eventType);
        fetchMock.post(address, eventResponse);
    };

    let client: CoveoAnalyticsClient;

    beforeEach(() => {
        jest.resetAllMocks();
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
            queryText: "",
        });

        const [body] = getParsedBodyCalls();

        expect(body).toMatchObject({
            queryText: "",
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

    const getParsedBodyCalls = (): any[] => {
        return fetchMock.calls().map(([, {body}]) => {
            return JSON.parse(body.toString());
        });
    };
});
