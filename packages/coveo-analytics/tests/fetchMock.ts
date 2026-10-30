import fm from 'fetch-mock';
import type {Mock} from 'vitest';
import * as CrossFetch from 'cross-fetch';

type FetchMockInstance = ReturnType<typeof fm.createInstance>;
type CallLog = NonNullable<ReturnType<FetchMockInstance['callHistory']['lastCall']>>;

/**
 * fetch-mock 12 moved call inspection onto `callHistory`, renamed `mock()` to
 * `route()`, split `reset()` into `hardReset()`/`clearHistory()`/
 * `removeRoutes()` and turned the `[url, options]` tuple returned by
 * `lastCall()` into a single object. The specs use the v9 spellings in ~100
 * places, so the v9 surface they rely on is re-exposed here instead of
 * rewriting every assertion.
 */
export type MockedFetch = FetchMockInstance & {
  calls: () => Array<[string, CallLog['options']]>;
  called: () => boolean;
  lastCall: () => [string, CallLog['options']] | undefined;
  lastUrl: () => string | undefined;
  mock: FetchMockInstance['route'];
  reset: () => void;
  resetHistory: () => void;
  resetBehavior: () => void;
};

const toV9Call = (call: CallLog): [string, CallLog['options']] => [call.url, call.options];

export function mockFetch() {
  const instance = fm.createInstance();
  const fetchMock: MockedFetch = Object.assign(instance, {
    calls: () => instance.callHistory.calls().map(toV9Call),
    called: () => instance.callHistory.called(),
    lastCall: (): [string, CallLog['options']] | undefined => {
      const call = instance.callHistory.lastCall();
      return call && toV9Call(call);
    },
    lastUrl: () => instance.callHistory.lastCall()?.url,
    mock: instance.route.bind(instance),
    reset: () => {
      instance.hardReset();
    },
    resetHistory: () => {
      instance.clearHistory();
    },
    resetBehavior: () => {
      instance.removeRoutes();
    },
  });

  return {
    fetchMock,
    // `cross-fetch` is aliased to tests/crossFetch.ts in vitest.config.ts, so
    // `fetch` is already a mock and can be reprogrammed directly. ESM exports
    // cannot be spied on the way the Jest setup did.
    fetchMockBeforeEach: () =>
      (CrossFetch.fetch as unknown as Mock)
        .mockReset()
        .mockImplementation(instance.fetchHandler as unknown as Mock),
  };
}

export function lastCallBody(fetchMock: MockedFetch): string {
  const body = fetchMock.lastCall()?.[1]?.body;
  return body!.toString();
}
