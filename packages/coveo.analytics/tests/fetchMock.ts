import fetchMockModule from 'fetch-mock';

export function mockFetch() {
  const fetchMock = fetchMockModule.sandbox();
  const crossFetchMock = require('./cross-fetch-mock');
  return {
    fetchMock,
    fetchMockBeforeEach: () => {
      crossFetchMock.setFetchMock(fetchMock);
    },
  };
}

export function lastCallBody(
  fetchMock: fetchMockModule.FetchMockSandbox
): string {
  const [, res]: any = fetchMock.lastCall();
  const {body} = res!;
  return body!.toString();
}
