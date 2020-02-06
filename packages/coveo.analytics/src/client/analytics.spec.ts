import * as analytics from './analytics';
import * as fetchMock from 'fetch-mock';
import * as events from '../events';

describe('Analytics', () => {
    const aToken = 'token';
    const anEndpoint = 'http://bloup';
    const A_VERSION = 'v1337';

    const client = new analytics.Client({
        token: aToken,
        endpoint: anEndpoint,
        version: A_VERSION
    });
    const viewEvent: events.ViewEventRequest = { location: 'here', contentIdKey: 'key', contentIdValue: 'value', language: 'en' };
    const viewEventResponse: events.ViewEventResponse = {
        visitId : '123',
        visitorId: '213'
    };

    it('should call fetch with the parameters', async () => {
        const address = `${anEndpoint}/rest/${A_VERSION}/analytics/view`;
        fetchMock.post(address, viewEventResponse);

        const response = await client.sendViewEvent(viewEvent);
        expect(response).toEqual(viewEventResponse);

        expect(fetchMock.called()).toBe(true);

        const [path, params] = fetchMock.lastCall();
        expect(path).toBe(address);

        const headers = params.headers as Record<string, string>;
        expect(headers['Authorization']).toBe(`Bearer ${aToken}`);
        expect(headers['Content-Type']).toBe('application/json');

        expect(params.body).not.toBeUndefined();

        const parsedBody = JSON.parse(params.body.toString());
        expect(parsedBody).toMatchObject(viewEvent);
    });
});
