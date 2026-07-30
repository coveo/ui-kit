import {vi, type Mock} from 'vitest';
import * as CrossFetch from 'cross-fetch';
import {AnalyticsBeaconClient} from './analyticsBeaconClient';
import {EventType} from '../events';
import {
  AnalyticsClientOrigin,
  IAnalyticsRequestOptions,
  PreprocessAnalyticsRequest,
} from './analyticsRequestClient';

describe('AnalyticsBeaconClient', () => {
  const baseUrl = 'https://bloup.com';
  const token = '👛';
  const currentVisitorId = 'mockVisitorId';

  const fetchMock = CrossFetch.fetch as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset().mockResolvedValue({ok: true});
  });

  const buildClient = (preprocessRequest?: PreprocessAnalyticsRequest) =>
    new AnalyticsBeaconClient({
      baseUrl,
      token,
      visitorIdProvider: {
        getCurrentVisitorId: () => Promise.resolve(currentVisitorId),
        setCurrentVisitorId: () => {},
      },
      preprocessRequest,
    });

  const getFetchFirstCallUrl = (): string => fetchMock.mock.calls[0][0];
  const getFetchFirstCallOptions = (): RequestInit => fetchMock.mock.calls[0][1];
  const getFetchFirstCallBody = (): string => getFetchFirstCallOptions().body as string;

  it('can send an event', async () => {
    await buildClient().sendEvent(EventType.custom, {wow: 'ok'});

    expect(getFetchFirstCallUrl()).toBe(
      `${baseUrl}/analytics/custom?access_token=👛&visitorId=${currentVisitorId}&discardVisitInfo=true`
    );
    expect(getFetchFirstCallBody()).toBe(`customEvent=${encodeURIComponent('{"wow":"ok"}')}`);
  });

  it('sends the event with fetch and keepalive instead of the Beacon API', async () => {
    await buildClient().sendEvent(EventType.click, {actionCause: 'documentOpen'});

    expect(getFetchFirstCallOptions()).toMatchObject({
      method: 'POST',
      keepalive: true,
      credentials: 'include',
      mode: 'cors',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    });
  });

  it('can send a collect event with the proper payload', async () => {
    await buildClient().sendEvent(EventType.collect, {
      pr1a: 'value',
      'to encode': 'to encode',
    });

    expect(getFetchFirstCallUrl()).toBe(
      `${baseUrl}/analytics/collect?visitorId=${currentVisitorId}&discardVisitInfo=true`
    );
    expect(getFetchFirstCallBody()).toBe(
      `access_token=${encodeURIComponent('👛')}&collectEvent=${encodeURIComponent(
        '{"pr1a":"value","to encode":"to encode"}'
      )}`
    );
  });

  it('can send a collect event with a more complex payload', async () => {
    await buildClient().sendEvent(EventType.collect, {value: {subvalue: 'ok'}});

    expect(getFetchFirstCallUrl()).toBe(
      `${baseUrl}/analytics/collect?visitorId=${currentVisitorId}&discardVisitInfo=true`
    );
    expect(getFetchFirstCallBody()).toBe(
      `access_token=${encodeURIComponent('👛')}&collectEvent=${encodeURIComponent('{"value":{"subvalue":"ok"}}')}`
    );
  });

  it('should not reject when the request fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(buildClient().sendEvent(EventType.click, {})).resolves.toBeUndefined();

    consoleError.mockRestore();
  });

  describe('when the keepalive body size limit is exceeded', () => {
    it('sends the event without keepalive', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await buildClient().sendEvent(EventType.click, {actionCause: 'a'.repeat(64 * 1024)});

      expect(getFetchFirstCallOptions().keepalive).toBe(false);
      expect(consoleWarn).toHaveBeenCalled();

      consoleWarn.mockRestore();
    });
  });

  describe('allows to preprocessRequest', () => {
    it('to modify the origin and the body of the request', async () => {
      let clientOrigin: AnalyticsClientOrigin;
      const processedRequest: IAnalyticsRequestOptions = {
        url: 'https://www.myownanalytics.com/endpoint',
        body: JSON.stringify({test: 'custom'}),
      };
      const client = buildClient((_request, type) => {
        clientOrigin = type;
        return processedRequest;
      });

      await client.sendEvent(EventType.collect, {});

      expect(clientOrigin!).toBe('analyticsBeacon');
      expect(getFetchFirstCallUrl()).toBe(processedRequest.url);
      expect(getFetchFirstCallBody()).toContain('%22test%22%3A%22custom%22');
    });

    it('to modify the headers of a click event', async () => {
      const client = buildClient((request) => {
        request.headers = {
          ...request.headers,
          'x-apigee-api-key': 'my-api-key',
        };
        return request;
      });

      await client.sendEvent(EventType.click, {actionCause: 'documentOpen'});

      expect(getFetchFirstCallOptions().headers).toEqual({
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-apigee-api-key': 'my-api-key',
      });
    });

    it('to receive the same option shape as the fetch client', async () => {
      let receivedRequest: IAnalyticsRequestOptions | undefined;
      const client = buildClient((request) => {
        receivedRequest = request;
        return request;
      });

      await client.sendEvent(EventType.click, {actionCause: 'documentOpen'});

      expect(receivedRequest).toEqual({
        url: `${baseUrl}/analytics/click?access_token=👛&visitorId=${currentVisitorId}&discardVisitInfo=true`,
        credentials: 'include',
        mode: 'cors',
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: JSON.stringify({actionCause: 'documentOpen'}),
      });
    });

    it('to modify the request body as a JSON string for a collect event', async () => {
      const client = buildClient((request) => {
        const bodyShouldBeAvailableAsJSONString = JSON.parse(request.body as string);
        expect(bodyShouldBeAvailableAsJSONString).toEqual({foo: 'bar'});
        bodyShouldBeAvailableAsJSONString.foo = 'baz';
        request.body = JSON.stringify(bodyShouldBeAvailableAsJSONString);
        return request;
      });

      await client.sendEvent(EventType.collect, {foo: 'bar'});

      expect(getFetchFirstCallBody()).toBe(
        'access_token=%F0%9F%91%9B&collectEvent=%7B%22foo%22%3A%22baz%22%7D'
      );
    });

    it('to modify the request body as a JSON string for a click event', async () => {
      const client = buildClient((request) => {
        const bodyParsedAsJSON = JSON.parse(request.body as string);
        expect(bodyParsedAsJSON).toEqual({actionCause: 'foo'});
        bodyParsedAsJSON.actionCause = 'bar';
        request.body = JSON.stringify(bodyParsedAsJSON);
        return request;
      });

      await client.sendEvent(EventType.click, {actionCause: 'foo'});

      expect(getFetchFirstCallBody()).toContain(
        `clickEvent=${encodeURIComponent('{"actionCause":"bar"}')}`
      );
    });

    it('to augment the request body as a JSON string for a click event', async () => {
      const client = buildClient((request) => {
        const bodyParsedAsJSON = JSON.parse(request.body as string);
        bodyParsedAsJSON.aNewProperty = 'bar';
        request.body = JSON.stringify(bodyParsedAsJSON);
        return request;
      });

      await client.sendEvent(EventType.click, {actionCause: 'foo'});

      expect(getFetchFirstCallBody()).toContain(
        `clickEvent=${encodeURIComponent('{"actionCause":"foo","aNewProperty":"bar"}')}`
      );
    });

    it('should keep original request body if preprocessRequest returns an invalid JSON string', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const client = buildClient((request) => {
        request.body = 'invalid JSON string';
        return request;
      });

      await client.sendEvent(EventType.click, {actionCause: 'bar'});

      expect(getFetchFirstCallBody()).toContain(
        `clickEvent=${encodeURIComponent(`{"actionCause":"bar"}`)}`
      );

      consoleError.mockRestore();
    });
  });
});
