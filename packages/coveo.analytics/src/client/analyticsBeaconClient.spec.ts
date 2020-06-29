import {AnalyticsBeaconClient} from './analyticsBeaconClient';
import {EventType} from '../events';

describe('AnalyticsBeaconClient', () => {
    const baseUrl = 'https://bloup.com';
    const token = '👛';
    const currentVisitorId = 'hereiam';

    const originalSendBeacon = navigator.sendBeacon;
    const sendBeaconMock = jest.fn();
    beforeAll(() => {
        navigator.sendBeacon = sendBeaconMock;
    });

    afterAll(() => {
        navigator.sendBeacon = originalSendBeacon;
    })

    beforeEach(() => {
        jest.clearAllMocks();
    })


    it('can send an event', async () => {
        const eventType: EventType = EventType.custom;

        const client = new AnalyticsBeaconClient({
            baseUrl,
            token,
            visitorIdProvider: {
                currentVisitorId,
            },
        });

        await client.sendEvent(eventType, {
            wow: 'ok',
        });

        expect(sendBeaconMock).toHaveBeenCalledWith(`${baseUrl}/analytics/custom?access_token=👛&visitorId=${currentVisitorId}`, jasmine.anything());
        expect(await getSendBeaconFirstCallBlobArgument()).toBe(`customEvent=${encodeURIComponent(`{"wow":"ok"}`)}`);
    });

    it('can send a collect event with the proper payload', async () => {
        const eventType: EventType = EventType.collect;

        const client = new AnalyticsBeaconClient({
            baseUrl,
            token,
            visitorIdProvider: {
                currentVisitorId,
            },
        });

        await client.sendEvent(eventType, {
            pr1a: 'value',
            "to encode": "to encode"
        });

        expect(sendBeaconMock).toHaveBeenCalledWith(`${baseUrl}/analytics/collect?access_token=👛&visitorId=${currentVisitorId}`, jasmine.anything());
        expect(await getSendBeaconFirstCallBlobArgument()).toBe("pr1a=value&to%20encode=to%20encode");
    });

    it('can send a collect event with a more complex payload', async () => {
        const eventType: EventType = EventType.collect;

        const client = new AnalyticsBeaconClient({
            baseUrl,
            token,
            visitorIdProvider: {
                currentVisitorId,
            },
        });

        await client.sendEvent(eventType, {
            value: {
                subvalue: 'ok'
            }
        });

        expect(sendBeaconMock).toHaveBeenCalledWith(`${baseUrl}/analytics/collect?access_token=👛&visitorId=${currentVisitorId}`, jasmine.anything());
        expect(await getSendBeaconFirstCallBlobArgument()).toBe(`value=${encodeURIComponent(JSON.stringify({subvalue: 'ok'}))}`);
    });

    const getSendBeaconFirstCallBlobArgument = async () => {
        const blobArgument: Blob = sendBeaconMock.mock.calls[0][1];
        expect(blobArgument.size).toBeGreaterThan(0);
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                resolve(reader.result);
            });
            reader.readAsText(blobArgument);
        });
    }
});
