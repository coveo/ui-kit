import {sandbox} from 'fetch-mock';
import * as CrossFetch from 'cross-fetch';

export function mockFetch() {
    const fetchMock = sandbox();
    return {
        fetchMock,
        fetchMockBeforeEach: () => jest.spyOn(CrossFetch, 'fetch').mockImplementation(fetchMock as any),
    };
}
