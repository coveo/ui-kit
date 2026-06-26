import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {streamSSEResponse} from './sse-streamer.js';
import type http from 'node:http';

function createMockResponse() {
  const chunks: string[] = [];
  let ended = false;
  let headStatusCode: number | undefined;
  const headHeaders: Record<string, string> = {};
  const setHeaders: Record<string, string> = {};

  const res = {
    setHeader: vi.fn((name: string, value: string) => {
      setHeaders[name.toLowerCase()] = value;
    }),
    writeHead: vi.fn((statusCode: number, headers?: Record<string, string>) => {
      headStatusCode = statusCode;
      if (headers) {
        for (const [k, v] of Object.entries(headers)) {
          headHeaders[k.toLowerCase()] = v;
        }
      }
    }),
    write: vi.fn((chunk: string) => {
      chunks.push(chunk);
    }),
    end: vi.fn(() => {
      ended = true;
    }),
    get statusCode() {
      return headStatusCode;
    },
    get headHeaders() {
      return headHeaders;
    },
    get setHeaders() {
      return setHeaders;
    },
    get chunks() {
      return chunks;
    },
    get ended() {
      return ended;
    },
  } as unknown as http.ServerResponse & {
    statusCode: number | undefined;
    headHeaders: Record<string, string>;
    setHeaders: Record<string, string>;
    chunks: string[];
    ended: boolean;
  };

  return res;
}

describe('streamSSEResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('responds with status 200', () => {
    const res = createMockResponse();
    streamSSEResponse(res, 'event:msg\ndata: hello\n\n');
    expect(res.statusCode).toBe(200);
  });

  it('sets Content-Type to text/event-stream', () => {
    const res = createMockResponse();
    streamSSEResponse(res, 'event:msg\ndata: hello\n\n');
    expect(res.headHeaders['content-type']).toBe('text/event-stream');
  });

  it('sets Cache-Control to no-cache', () => {
    const res = createMockResponse();
    streamSSEResponse(res, 'event:msg\ndata: hello\n\n');
    expect(res.headHeaders['cache-control']).toBe('no-cache, no-transform');
  });

  it('sets Connection to keep-alive', () => {
    const res = createMockResponse();
    streamSSEResponse(res, 'event:msg\ndata: hello\n\n');
    expect(res.headHeaders['connection']).toBe('keep-alive');
  });

  it('sets X-Accel-Buffering to no', () => {
    const res = createMockResponse();
    streamSSEResponse(res, 'event:msg\ndata: hello\n\n');
    expect(res.headHeaders['x-accel-buffering']).toBe('no');
  });

  it('sets CORS headers via setCorsHeaders', () => {
    const res = createMockResponse();
    streamSSEResponse(res, 'event:msg\ndata: hello\n\n');
    expect(res.setHeaders['access-control-allow-origin']).toBe('*');
  });

  it('streams events individually with delays', () => {
    const res = createMockResponse();
    const content =
      'event:turn_started\ndata: {"type":"turn"}\n\nevent:message\ndata: {"type":"text"}\n\n';
    streamSSEResponse(res, content);

    expect(res.write).toHaveBeenCalledTimes(1);
    expect(res.ended).toBe(false);

    vi.advanceTimersByTime(25);
    expect(res.write).toHaveBeenCalledTimes(2);
    expect(res.ended).toBe(false);

    vi.advanceTimersByTime(25);
    expect(res.ended).toBe(true);
  });

  it('writes each event terminated with double newline', () => {
    const res = createMockResponse();
    const content = 'event:msg\ndata: hello\n\n';
    streamSSEResponse(res, content);

    vi.runAllTimers();

    expect(res.chunks[0]).toBe('event:msg\ndata: hello\n\n');
    expect(res.ended).toBe(true);
  });

  it('ends immediately for empty content', () => {
    const res = createMockResponse();
    streamSSEResponse(res, '');

    expect(res.ended).toBe(true);
  });

  describe('v0.9 dynamic translation', () => {
    it('does not translate when version is not 0.9', () => {
      const res = createMockResponse();
      const content =
        'event:message\ndata: {"type": "ACTIVITY_SNAPSHOT", "content": {"operations": [{"beginRendering": {"surfaceId": "s1", "root": "r1"}}]}}\n\n';
      streamSSEResponse(res, content, '0.8');

      vi.runAllTimers();
      expect(res.chunks[0]).toBe(content);
    });

    it('translates beginRendering to createSurface when version is 0.9', () => {
      const res = createMockResponse();
      const content =
        'event:message\ndata: {"type": "ACTIVITY_SNAPSHOT", "content": {"operations": [{"beginRendering": {"surfaceId": "s1", "root": "r1", "catalogId": "cat1"}}]}}\n\n';
      streamSSEResponse(res, content, '0.9');

      vi.runAllTimers();
      const parsed = JSON.parse(
        res.chunks[0].replace('event:message\ndata: ', '').trim()
      );
      expect(parsed.content.operations[0]).toEqual({
        createSurface: {
          surfaceId: 's1',
          catalogId: 'cat1',
          version: '0.9',
        },
      });
    });

    it('translates surfaceUpdate to updateComponents when version is 0.9', () => {
      const res = createMockResponse();
      const content =
        'event:message\ndata: {"type": "ACTIVITY_SNAPSHOT", "content": {"operations": [{"surfaceUpdate": {"surfaceId": "s1", "components": []}}]}}\n\n';
      streamSSEResponse(res, content, '0.9');

      vi.runAllTimers();
      const parsed = JSON.parse(
        res.chunks[0].replace('event:message\ndata: ', '').trim()
      );
      expect(parsed.content.operations[0]).toEqual({
        updateComponents: {
          surfaceId: 's1',
          components: [],
        },
      });
    });

    it('translates dataModelUpdate to updateDataModel when version is 0.9', () => {
      const res = createMockResponse();
      const content =
        'event:message\ndata: {"type": "ACTIVITY_SNAPSHOT", "content": {"operations": [{"dataModelUpdate": {"surfaceId": "s1", "contents": [{"key": "k1", "valueString": "v1"}, {"key": "k2", "valueMap": [{"valueMap": [{"key": "subKey", "valueNumber": 123}]}]}]}}]}}\n\n';
      streamSSEResponse(res, content, '0.9');

      vi.runAllTimers();
      const parsed = JSON.parse(
        res.chunks[0].replace('event:message\ndata: ', '').trim()
      );
      expect(parsed.content.operations[0]).toEqual({
        updateDataModel: {
          surfaceId: 's1',
          path: '/',
          value: {
            k1: 'v1',
            k2: [{subKey: 123}],
          },
        },
      });
    });
  });
});
