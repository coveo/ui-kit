import * as fm from 'fetch-mock';
import * as CrossFetch from 'cross-fetch';

export function mockFetch() {
    const fetchMock = fm.sandbox();
    return {
        fetchMock,
        fetchMockBeforeEach: () => jest.spyOn(CrossFetch, 'fetch').mockImplementation(fetchMock as any),
    };
}

export function lastCallBody(fetchMock: fm.FetchMockSandbox): string {
    const [, res]: any = fetchMock.lastCall();
    const {body} = res!;
    return body!.toString();
}
