import * as sinon from 'sinon';
import test from 'ava';
import { AnalyticsBeaconClient } from './analyticsBeaconClient';
import { EventType } from '../events';

test('AnalyticsBeaconClient: can send an event', async t => {
    const sendBeaconSpy = sinon.spy(navigator, 'sendBeacon');
    const baseUrl = "https://bloup.com";
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

    t.true(sendBeaconSpy.calledOnce, 'navigator.sendBeacon was called once.');
});
