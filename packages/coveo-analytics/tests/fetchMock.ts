import * as fm from 'fetch-mock';
import * as CrossFetch from 'cross-fetch';

export function mockFetch() {
  // oxlint-disable-next-line import/namespace -- fetch-mock's separate type package does not declare its runtime sandbox API.
  const fetchMock = fm.sandbox();
  return {
    fetchMock,
    fetchMockBeforeEach: () =>
      jest.spyOn(CrossFetch, 'fetch').mockImplementation(fetchMock as any),
  };
}

export function lastCallBody(fetchMock: fm.FetchMockSandbox): string {
  const [, res]: any = fetchMock.lastCall();
  const {body} = res!;
  return body!.toString();
}
