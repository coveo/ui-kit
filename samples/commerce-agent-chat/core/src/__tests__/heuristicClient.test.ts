import {beforeEach, describe, expect, it, vi} from 'vitest';

import {classifyQuery, ClassificationError} from '../lib/heuristicClient.js';

describe('classifyQuery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "search" when endpoint responds with search decision', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({decision: 'search'}), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      })
    );

    const result = await classifyQuery('red shoes');
    expect(result).toBe('search');
  });

  it('returns "agent" when endpoint responds with agent decision', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({decision: 'agent'}), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      })
    );

    const result = await classifyQuery('help me find a birthday gift');
    expect(result).toBe('agent');
  });

  it('throws ClassificationError on HTTP error status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Internal Server Error', {status: 500})
    );

    await expect(classifyQuery('test')).rejects.toThrow(ClassificationError);
    await expect(classifyQuery('test')).rejects.toThrow(/HTTP 500/);
  });

  it('throws ClassificationError on invalid JSON response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('not json', {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      })
    );

    await expect(classifyQuery('test')).rejects.toThrow(ClassificationError);
    await expect(classifyQuery('test')).rejects.toThrow(/invalid JSON/);
  });

  it('throws ClassificationError on unexpected payload shape', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({result: 'unknown'}), {
          status: 200,
          headers: {'Content-Type': 'application/json'},
        })
      )
    );

    await expect(classifyQuery('test')).rejects.toThrow(ClassificationError);
    await expect(classifyQuery('test')).rejects.toThrow(/unexpected payload/);
  });

  it('throws ClassificationError on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('Failed to fetch')
    );

    await expect(classifyQuery('test')).rejects.toThrow(ClassificationError);
    await expect(classifyQuery('test')).rejects.toThrow(
      /Failed to reach classification endpoint/
    );
  });

  it('throws ClassificationError on timeout (AbortError)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError')
    );

    await expect(classifyQuery('test')).rejects.toThrow(ClassificationError);
    await expect(classifyQuery('test')).rejects.toThrow(/timed out/);
  });

  it('sends query in POST body to the correct endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({decision: 'agent'}), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      })
    );

    await classifyQuery('what is the best laptop?');

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/heuristics/classify',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({query: 'what is the best laptop?'}),
      })
    );
  });
});
