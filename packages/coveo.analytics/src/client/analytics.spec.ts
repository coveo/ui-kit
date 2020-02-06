import * as fetchMock from 'fetch-mock';
import { EventType, ViewEventRequest, DefaultEventResponse } from '../events';
import { CoveoAnalyticsClient } from './analytics';
import { CookieStorage } from '../storage';

describe('Analytics', () => {
    const aToken = 'token';
    const anEndpoint = 'http://bloup';
    const A_VERSION = 'v1337';
    const aVisitorId = '123';

    const viewEvent: ViewEventRequest = { location: 'here', contentIdKey: 'key', contentIdValue: 'value', language: 'en' };
    const eventResponse: DefaultEventResponse = {
        visitId : 'firsttimevisiting',
        visitorId: aVisitorId
    };

    const endpointForEventType = (eventType: EventType) => `${anEndpoint}/rest/${A_VERSION}/analytics/${eventType}`;
    const mockFetchRequestForEventType = (eventType: EventType) => {
        const address = endpointForEventType(eventType);
        fetchMock.post(address, eventResponse);
        fetchMock.post(`${address}?visitor=${aVisitorId}`, eventResponse);
    };

    let client: CoveoAnalyticsClient;

    beforeEach(() => {
        new CookieStorage().removeItem('visitorId');
        localStorage.clear();
        client = new CoveoAnalyticsClient({
            token: aToken,
            endpoint: anEndpoint,
            version: A_VERSION
        });
        fetchMock.reset();
    });

    it('should call fetch with the parameters', async () => {
        mockFetchRequestForEventType(EventType.view);

        const response = await client.sendViewEvent(viewEvent);
        expect(response).toEqual(eventResponse);

        expect(fetchMock.called()).toBe(true);

        const [path, { headers: headers, body }] = fetchMock.lastCall();
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

        const [, { body }] = fetchMock.lastCall();

        const parsedBody = JSON.parse(body.toString());
        expect(parsedBody).toMatchObject({
            language: 'en',
            userAgent: navigator.userAgent
        });
    });

    it('should send the events in the order they were called', async () => {
        mockFetchRequestForEventType(EventType.view);
        const firstRequest = client.sendViewEvent({
            ...viewEvent,
            'customData': {
                index: 0
            }
        });
        const secondRequest = client.sendViewEvent({
            ...viewEvent,
            'customData': {
                index: 1
            }
        });
        const thirdRequest = client.sendViewEvent({
            ...viewEvent,
            'customData': {
                index: 2
            }
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

    describe('with event type mapping with variable arguments', () => {
        const specialEventType = '🌟special🌟';
        const argumentNames = ['1️⃣', '2️⃣', '3️⃣'];
        beforeEach(() => {
            mockFetchRequestForEventType(EventType.custom);
            client.addEventTypeMapping(specialEventType, {
                newEventType: EventType.custom,
                variableLengthArgumentsNames: argumentNames
            });
        });

        it('should properly parse empty arguments', async () => {
            await client.sendEvent(specialEventType);

            const [path, { body }] = fetchMock.lastCall();
            expect(path).toBe(endpointForEventType(EventType.custom));

            const parsedBody = JSON.parse(body.toString());
            expect(parsedBody).toEqual({});
        });

        it('should properly parse 1 argument', async () => {
            await client.sendEvent(specialEventType, 'something');

            const [, { body }] = fetchMock.lastCall();

            const parsedBody = JSON.parse(body.toString());
            expect(parsedBody).toEqual({
                [argumentNames[0]]: 'something'
            });
        });

        it('should properly parse all arguments', async () => {
            await client.sendEvent(specialEventType, 'something', 'another', '🌈');

            const [, { body }] = fetchMock.lastCall();

            const parsedBody = JSON.parse(body.toString());
            expect(parsedBody).toEqual({
                [argumentNames[0]]: 'something',
                [argumentNames[1]]: 'another',
                [argumentNames[2]]: '🌈'
            });
        });

        it('should properly handle a finished object argument', async () => {
            await client.sendEvent(specialEventType, 'something', { mergethis: 'plz' });

            const [, { body }] = fetchMock.lastCall();

            const parsedBody = JSON.parse(body.toString());
            expect(parsedBody).toEqual({
                [argumentNames[0]]: 'something',
                mergethis: 'plz'
            });
        });
    });

    describe('with event type mapping activating context values', () => {
        const locationContextKeys = ['location'];
        const screenContextKeys = ['screenResolution', 'screenColor'];
        const navigatorContextKeys = ['language', 'userAgent'];

        const specialEventType = '🌟special🌟';
        beforeEach(() => {
            mockFetchRequestForEventType(EventType.custom);
            client.addEventTypeMapping(specialEventType, {
                newEventType: EventType.custom,
                addDefaultContextInformation: true
            });
        });

        it('should properly add location, screen and navigator context keys', async () => {
            await client.sendEvent(specialEventType);

            const [, { body }] = fetchMock.lastCall();

            const parsedBody = JSON.parse(body.toString());
            assertHaveAllProperties(parsedBody, [...locationContextKeys, ...screenContextKeys, ...navigatorContextKeys]);
        });

        const assertHaveAllProperties = (object: any, properties: string[]) => {
            properties.forEach(property => expect(object).toHaveProperty(property));
        };
    });
});
