/**
 * Search Endpoint Client Tests
 */

import {describe, it, expect, beforeEach, vi, MockedFunction} from 'vitest';
import {createSearchEndpointClient} from './search-endpoint-client.js';
import {executeHttpRequest} from '@/src/internal/api/protocol/http.js';

vi.mock('@/src/internal/api/protocol/http.js', () => ({
  executeHttpRequest: vi.fn(),
}));

describe('SearchEndpointClient', () => {
  let client: ReturnType<typeof createSearchEndpointClient>;
  let mockedExecuteHttpRequest: MockedFunction<typeof executeHttpRequest>;

  beforeEach(() => {
    client = createSearchEndpointClient();
    mockedExecuteHttpRequest = vi.mocked(executeHttpRequest);
    mockedExecuteHttpRequest.mockReset();
  });

  it('should return configuration error when organizationId is missing', async () => {
    const response = await client.call(
      {q: 'test'},
      {accessToken: 'test-token'}
    );

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected search endpoint call to fail');
    }
    expect(response.error).toContain('Organization ID is not set');
    expect(mockedExecuteHttpRequest).not.toHaveBeenCalled();
  });

  it('should return configuration error when accessToken is missing', async () => {
    const response = await client.call(
      {q: 'test'},
      {organizationId: 'test-org-id'}
    );

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected search endpoint call to fail');
    }
    expect(response.error).toContain('Access token is not set');
    expect(mockedExecuteHttpRequest).not.toHaveBeenCalled();
  });

  it('should call executeHttpRequest with built request options', async () => {
    mockedExecuteHttpRequest.mockResolvedValue({
      success: true,
      data: {
        totalCount: 0,
        results: [],
      },
    });

    const request = {q: 'test query'};
    const response = await client.call(request, {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
    });

    expect(response.success).toBe(true);
    expect(mockedExecuteHttpRequest).toHaveBeenCalledWith({
      url: 'https://test-org-id.org.coveo.com/rest/search/v2?organizationId=test-org-id',
      method: 'POST',
      body: request,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
        'Coveo-Organization-Id': 'test-org-id',
      },
    });
  });

  it('should use configured custom endpoint', async () => {
    mockedExecuteHttpRequest.mockResolvedValue({
      success: true,
      data: {},
    } as any);

    await client.call(
      {q: 'test'},
      {
        organizationId: 'test-org-id',
        accessToken: 'test-token',
        endpoint: 'https://custom.platform.coveo.com',
      }
    );

    expect(mockedExecuteHttpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://custom.platform.coveo.com/rest/search/v2?organizationId=test-org-id',
      })
    );
  });

  it('should normalize missing transport error message', async () => {
    mockedExecuteHttpRequest.mockResolvedValue({
      success: false,
    });

    const response = await client.call(
      {q: 'test'},
      {organizationId: 'test-org-id', accessToken: 'test-token'}
    );

    expect(response).toEqual({
      success: false,
      error: 'Search request failed.',
    });
  });

  it('should transform thrown errors into failed client results', async () => {
    mockedExecuteHttpRequest.mockRejectedValue(new Error('network down'));

    const response = await client.call(
      {q: 'test'},
      {organizationId: 'test-org-id', accessToken: 'test-token'}
    );

    expect(response).toEqual({
      success: false,
      error: 'network down',
    });
  });

  it('should URL-encode the organizationId in the query param', async () => {
    mockedExecuteHttpRequest.mockResolvedValue({
      success: true,
      data: {},
    } as any);

    await client.call(
      {q: 'test'},
      {
        organizationId: 'my-org-123',
        accessToken: 'test-token',
        endpoint: 'https://proxy.example.com',
      }
    );

    const calledUrl = mockedExecuteHttpRequest.mock.calls[0][0].url;
    expect(calledUrl).toContain('?organizationId=my-org-123');
  });

  it('should pass the abort signal to the HTTP request', async () => {
    mockedExecuteHttpRequest.mockResolvedValue({
      success: true,
      data: {},
    } as any);

    const controller = new AbortController();

    await client.call(
      {q: 'test'},
      {organizationId: 'test-org-id', accessToken: 'test-token'},
      {signal: controller.signal}
    );

    expect(mockedExecuteHttpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        signal: controller.signal,
      })
    );
  });
});
