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
