import {createRelay} from '../lib/npm/relay';
import {createMockEvent} from './__mocks__/event.js';

const sampleAnalyticsEndpoint =
  'https://searchuisamples.analytics.org.coveo.com/rest/organizations';
const sampleAccessToken = 'xx564559b1-0045-48e1-953c-3addd1ee4457';

describe('functional tests', () => {
  it('can send an event', async () => {
    const relay = createRelay({
      token: sampleAccessToken,
      url: `${sampleAnalyticsEndpoint}/searchuisamples/events/v1`,
      trackingId: null,
    });
    const event = createMockEvent({meta: {type: 'api.event.itemClick'}});
    await expect(
      relay.emit('api.event.itemClick', event)
    ).resolves.not.toThrow();
  });

  it('throws on an invalid event', async () => {
    const relay = createRelay({
      token: sampleAccessToken,
      url: `${sampleAnalyticsEndpoint}/searchuisamples/events/v1`,
      trackingId: null,
    });
    const event = {};
    await expect(
      //@ts-expect-error("forcing event type to null to trigger")
      relay.emit(null, event)
    ).rejects.toThrowError(
      expect.objectContaining({
        message: expect.stringContaining(
          'Received event was rejected for processing'
        ),
      })
    );
  });

  it('throws on invalid auth', async () => {
    const relay = createRelay({
      token: 'xxnoTokenHere',
      url: `${sampleAnalyticsEndpoint}/searchuisamples/events/v1`,
      trackingId: null,
    });
    await expect(relay.emit('api.event.itemClick', {})).rejects.toThrowError(
      new Error('Error 401: Failed to send the event(s).')
    );
  });

  it('throws on invalid url', async () => {
    const relay = createRelay({
      token: sampleAccessToken,
      url: `${sampleAnalyticsEndpoint}/searchuisamples/events/v0`,
      trackingId: null,
    });
    await expect(relay.emit('api.event.itemClick', {})).rejects.toThrowError(
      new Error('Error 404: Failed to send the event(s).')
    );
  });

  it('throws on invalid org', async () => {
    const relay = createRelay({
      token: sampleAccessToken,
      url: `${sampleAnalyticsEndpoint}/nono/events/v1`,
      trackingId: null,
    });
    await expect(relay.emit('api.event.itemClick', {})).rejects.toThrowError(
      new Error('Error 403: Failed to send the event(s).')
    );
  });
});
