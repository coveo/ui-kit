import { AnalyticsBeaconClient } from './analyticsBeaconClient';
import { EventType } from '../events';

describe('AnalyticsBeaconClient', () => {

    it('can send an event', async () => {
        navigator.sendBeacon = jest.fn();
        const baseUrl = 'https://bloup.com';
        const token = '👛';
        const currentVisitorId = 'hereiam';
        const eventType: EventType = EventType.custom;

        const client = new AnalyticsBeaconClient({ baseUrl,
            token,
            visitorIdProvider: {
                currentVisitorId
            }
        });

        await client.sendEvent(eventType, {
            'wow': 'ok'
        });

        expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
    });

});
