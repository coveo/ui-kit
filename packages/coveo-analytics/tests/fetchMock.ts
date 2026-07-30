import fm from 'fetch-mock';
import type {Mock} from 'vitest';
import * as CrossFetch from 'cross-fetch';

export function mockFetch() {
  const fetchMock = fm.sandbox();
  return {
    fetchMock,
    // `cross-fetch` is aliased to tests/crossFetch.ts in vitest.config.ts, so
    // `fetch` is already a mock and can be reprogrammed directly. ESM exports
    // cannot be spied on the way the Jest setup did.
    fetchMockBeforeEach: () =>
      (CrossFetch.fetch as unknown as Mock).mockReset().mockImplementation(fetchMock as any),
  };
}

export function lastCallBody(fetchMock: fm.FetchMockSandbox): string {
  const [, res]: any = fetchMock.lastCall();
  const {body} = res!;
  return body!.toString();
}

/**
 * Events sent through the keepalive client, such as click events, are form-encoded as
 * `<eventType>Event=<uri-encoded JSON>`. Returns the JSON payload of such a body, or the
 * body itself when it is already JSON.
 */
export function decodeEventBody(body: string): string {
  const encodedEvent = /(?:^|&)\w+Event=(.*)$/.exec(body);
  return encodedEvent ? decodeURIComponent(encodedEvent[1]) : body;
}
