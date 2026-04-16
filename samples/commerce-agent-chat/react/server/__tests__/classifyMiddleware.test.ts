import {describe, expect, it} from 'vitest';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {classifyQueryMiddleware} from '../classifyMiddleware.js';
import {EventEmitter} from 'node:events';

function createMockRequest(method: string, body?: string): IncomingMessage {
  const req = new EventEmitter() as IncomingMessage;
  req.method = method;
  if (body !== undefined) {
    process.nextTick(() => {
      req.emit('data', Buffer.from(body));
      req.emit('end');
    });
  }
  return req;
}

function createMockResponse(): ServerResponse & {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
} {
  const res = {
    statusCode: 0,
    body: '',
    headers: {} as Record<string, string>,
    writeHead(status: number, headers?: Record<string, string>) {
      res.statusCode = status;
      if (headers) {
        Object.assign(res.headers, headers);
      }
    },
    end(data?: string) {
      if (data) {
        res.body = data;
      }
    },
  } as unknown as ServerResponse & {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  };
  return res;
}

describe('classifyQueryMiddleware', () => {
  it('returns 405 for non-POST requests', () => {
    const req = createMockRequest('GET');
    const res = createMockResponse();

    classifyQueryMiddleware(req, res);

    expect(res.statusCode).toBe(405);
    expect(JSON.parse(res.body)).toEqual({error: 'Method not allowed'});
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = createMockRequest('POST', 'not-json');
    const res = createMockResponse();

    classifyQueryMiddleware(req, res);
    await new Promise((r) => setTimeout(r, 10));

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({error: 'Invalid JSON'});
  });

  it('returns 400 when query field is missing', async () => {
    const req = createMockRequest('POST', JSON.stringify({text: 'hello'}));
    const res = createMockResponse();

    classifyQueryMiddleware(req, res);
    await new Promise((r) => setTimeout(r, 10));

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({
      error: 'Missing "query" string field',
    });
  });

  it('classifies short keyword queries as search', async () => {
    const req = createMockRequest('POST', JSON.stringify({query: 'red shoes'}));
    const res = createMockResponse();

    classifyQueryMiddleware(req, res);
    await new Promise((r) => setTimeout(r, 10));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({decision: 'search'});
  });

  it('classifies questions as agent', async () => {
    const req = createMockRequest(
      'POST',
      JSON.stringify({query: 'what is the best laptop?'})
    );
    const res = createMockResponse();

    classifyQueryMiddleware(req, res);
    await new Promise((r) => setTimeout(r, 10));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({decision: 'agent'});
  });

  it('classifies conversational starters as agent', async () => {
    const req = createMockRequest(
      'POST',
      JSON.stringify({query: 'help me find a gift for my mom'})
    );
    const res = createMockResponse();

    classifyQueryMiddleware(req, res);
    await new Promise((r) => setTimeout(r, 10));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({decision: 'agent'});
  });

  it('classifies recommend prefix as agent', async () => {
    const req = createMockRequest(
      'POST',
      JSON.stringify({query: 'recommend a good headset'})
    );
    const res = createMockResponse();

    classifyQueryMiddleware(req, res);
    await new Promise((r) => setTimeout(r, 10));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({decision: 'agent'});
  });

  it('classifies empty query as search', async () => {
    const req = createMockRequest('POST', JSON.stringify({query: ''}));
    const res = createMockResponse();

    classifyQueryMiddleware(req, res);
    await new Promise((r) => setTimeout(r, 10));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({decision: 'search'});
  });

  it('classifies longer free-form text as agent', async () => {
    const req = createMockRequest(
      'POST',
      JSON.stringify({
        query:
          'I have a budget of 500 dollars and need a new laptop for school',
      })
    );
    const res = createMockResponse();

    classifyQueryMiddleware(req, res);
    await new Promise((r) => setTimeout(r, 10));

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({decision: 'agent'});
  });
});
