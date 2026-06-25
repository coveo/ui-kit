import {describe, expect, it, vi} from 'vitest';
import {HttpError, fetchWithRetry} from './http.js';

describe('fetchWithRetry', () => {
  it('retries once after a network failure, then returns the response', async () => {
    const ok = {ok: true, body: {}} as unknown as Response;
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(ok);
    expect(await fetchWithRetry('http://x', {fetchImpl})).toBe(ok);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('throws a clear error after exhausting retries on network failures', async () => {
    const netFail = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
    await expect(
      fetchWithRetry('http://x', {retries: 1, fetchImpl: netFail})
    ).rejects.toThrow(/Failed to fetch/);
    expect(netFail).toHaveBeenCalledTimes(2);
  });

  it('fails fast on a 4xx, surfacing the status as an HttpError', async () => {
    const notFound = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as unknown as Response);
    await expect(
      fetchWithRetry('http://x', {fetchImpl: notFound})
    ).rejects.toThrow(HttpError);
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it('retries on a 5xx response, then throws a clear error', async () => {
    const serverError = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    } as unknown as Response);
    await expect(
      fetchWithRetry('http://x', {retries: 1, fetchImpl: serverError})
    ).rejects.toThrow(/Failed to fetch/);
    expect(serverError).toHaveBeenCalledTimes(2);
  });
});
