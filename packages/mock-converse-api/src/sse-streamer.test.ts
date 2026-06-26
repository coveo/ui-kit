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
});
