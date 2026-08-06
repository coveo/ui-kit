import {vi, type Mock} from 'vitest';
import * as CrossFetch from 'cross-fetch';
import {BrowserRuntime} from './runtimeEnvironment';
import {EventType} from '../events';
import {IAnalyticsClientOptions} from './analyticsRequestClient';
import {BufferedRequest} from './analytics';

describe('BrowserRuntime', () => {
  const fetchMock = CrossFetch.fetch as unknown as Mock;

  const clientOptions: IAnalyticsClientOptions = {
    baseUrl: 'https://bloup.com',
    token: 'token',
    visitorIdProvider: {
      getCurrentVisitorId: () => Promise.resolve('visitor-id'),
      setCurrentVisitorId: () => {},
    },
  };

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ok: true});
  });

  it('should send click events with the keepalive client', () => {
    const runtime = new BrowserRuntime(clientOptions, () => []);

    expect(runtime.getClientDependingOnEventType(EventType.click)).not.toBe(runtime.client);
    expect(runtime.getClientDependingOnEventType(EventType.view)).toBe(runtime.client);
  });

  it('should flush the buffered requests with fetch and keepalive on beforeunload', async () => {
    const bufferedRequests: Array<BufferedRequest> = [
      {eventType: EventType.click, payload: {actionCause: 'documentOpen'}},
    ];
    new BrowserRuntime(clientOptions, () => bufferedRequests);

    window.dispatchEvent(new Event('beforeunload'));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/analytics/click');
    expect(options.keepalive).toBe(true);
    expect(options.body).toContain(`clickEvent=${encodeURIComponent('{"actionCause"')}`);
  });
});
