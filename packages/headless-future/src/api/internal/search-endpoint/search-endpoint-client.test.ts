/**
 * Search Endpoint Client Tests
 */

import {describe, it, expect, beforeEach, vi, MockedFunction} from 'vitest';
import {callSearchEndpoint} from './search-endpoint-client.js';
import {executeHttpRequest} from '@/src/api/internal/protocol/http.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {configurationSlice} from '@/src/core/internal/configuration/configuration-slice.js';
import * as configurationMutations from '@/src/core/interface/configuration/configuration-mutators.js';

vi.mock('@/src/api/internal/protocol/http.js', () => ({
  executeHttpRequest: vi.fn(),
}));

describe('callSearchEndpoint()', () => {
  let engine: FullEngine;
  let mockedExecuteHttpRequest: MockedFunction<typeof executeHttpRequest>;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(configurationSlice);
    mockedExecuteHttpRequest = vi.mocked(executeHttpRequest);
    mockedExecuteHttpRequest.mockReset();
  });

  it('should return configuration error when organizationId is missing', async () => {
    engine.mutate(configurationMutations.setAccessToken('test-token'));

    const response = await callSearchEndpoint(engine, {q: 'test'});

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected callSearchEndpoint to fail');
    }
    expect(response.error).toContain('Organization ID is not set');
    expect(mockedExecuteHttpRequest).not.toHaveBeenCalled();
  });

  it('should return configuration error when accessToken is missing', async () => {
    engine.mutate(configurationMutations.setOrganizationId('test-org-id'));

    const response = await callSearchEndpoint(engine, {q: 'test'});

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected callSearchEndpoint to fail');
    }
    expect(response.error).toContain('Access token is not set');
    expect(mockedExecuteHttpRequest).not.toHaveBeenCalled();
  });

  it('should call executeHttpRequest with built request options', async () => {
    engine.mutate(configurationMutations.setOrganizationId('test-org-id'));
    engine.mutate(configurationMutations.setAccessToken('test-token'));

    mockedExecuteHttpRequest.mockResolvedValue({
      success: true,
      data: {
        totalCount: 0,
        results: [],
      },
    });

    const request = {q: 'test query'};
    const response = await callSearchEndpoint(engine, request);

    expect(response.success).toBe(true);
    expect(mockedExecuteHttpRequest).toHaveBeenCalledWith({
      url: 'https://platform.cloud.coveo.com/rest/search/v2',
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
    engine.mutate(configurationMutations.setOrganizationId('test-org-id'));
    engine.mutate(configurationMutations.setAccessToken('test-token'));
    engine.mutate(
      configurationMutations.setEndpoint('https://custom.platform.coveo.com')
    );

    mockedExecuteHttpRequest.mockResolvedValue({
      success: true,
      data: {},
    } as any);

    await callSearchEndpoint(engine, {q: 'test'});

    expect(mockedExecuteHttpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://custom.platform.coveo.com/rest/search/v2',
      })
    );
  });

  it('should normalize missing transport error message', async () => {
    engine.mutate(configurationMutations.setOrganizationId('test-org-id'));
    engine.mutate(configurationMutations.setAccessToken('test-token'));

    mockedExecuteHttpRequest.mockResolvedValue({
      success: false,
    });

    const response = await callSearchEndpoint(engine, {q: 'test'});

    expect(response).toEqual({
      success: false,
      error: 'Search request failed.',
    });
  });
});
