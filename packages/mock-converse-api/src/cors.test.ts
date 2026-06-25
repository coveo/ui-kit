import {describe, it, expect, vi} from 'vitest';
import type http from 'node:http';
import {setCorsHeaders, handlePreflight} from './cors.js';

function createMockResponse() {
  const headers: Record<string, string> = {};
  return {
    setHeader: vi.fn((name: string, value: string) => {
      headers[name] = value;
    }),
    writeHead: vi.fn(),
    end: vi.fn(),
    _headers: headers,
  } as unknown as http.ServerResponse & {_headers: Record<string, string>};
}

describe('setCorsHeaders', () => {
  it('sets Access-Control-Allow-Origin to *', () => {
    const res = createMockResponse();
    setCorsHeaders(res);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*'
    );
  });

  it('sets Access-Control-Allow-Methods to POST, OPTIONS', () => {
    const res = createMockResponse();
    setCorsHeaders(res);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'POST, OPTIONS'
    );
  });

  it('sets Access-Control-Allow-Headers to Content-Type, Authorization', () => {
    const res = createMockResponse();
    setCorsHeaders(res);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  });
});

describe('handlePreflight', () => {
  it('sets CORS headers on the response', () => {
    const res = createMockResponse();
    handlePreflight(res);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'POST, OPTIONS'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  });

  it('responds with HTTP 204', () => {
    const res = createMockResponse();
    handlePreflight(res);
    expect(res.writeHead).toHaveBeenCalledWith(204);
  });

  it('ends the response', () => {
    const res = createMockResponse();
    handlePreflight(res);
    expect(res.end).toHaveBeenCalled();
  });
});
