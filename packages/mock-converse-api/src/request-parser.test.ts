import {Readable} from 'node:stream';
import type http from 'node:http';
import {describe, it, expect} from 'vitest';
import {parseRequestBody, RequestParseError} from './request-parser.js';

function createMockRequest(body: string): http.IncomingMessage {
  const stream = new Readable({
    read() {
      this.push(Buffer.from(body));
      this.push(null);
    },
  });
  return stream as unknown as http.IncomingMessage;
}

describe('parseRequestBody', () => {
  it('parses a valid request body with message field', async () => {
    const req = createMockRequest(JSON.stringify({message: 'hello world'}));
    const result = await parseRequestBody(req);
    expect(result).toEqual({message: 'hello world'});
  });

  it('extracts only the message field, ignoring other fields', async () => {
    const req = createMockRequest(
      JSON.stringify({
        message: 'test prompt',
        trackingId: 'abc',
        language: 'en',
        context: {user: {userAgent: 'test'}},
      })
    );
    const result = await parseRequestBody(req);
    expect(result).toEqual({message: 'test prompt'});
  });

  it('throws RequestParseError with 400 for malformed JSON', async () => {
    const req = createMockRequest('not valid json {{{');
    await expect(parseRequestBody(req)).rejects.toThrow(RequestParseError);

    try {
      await parseRequestBody(createMockRequest('invalid'));
    } catch (err) {
      expect(err).toBeInstanceOf(RequestParseError);
      const parseError = err as RequestParseError;
      expect(parseError.statusCode).toBe(400);
      expect(parseError.errorBody.error).toBe('Invalid JSON');
      expect(parseError.errorBody.details).toBeDefined();
    }
  });

  it('throws RequestParseError with 400 when message field is missing', async () => {
    const req = createMockRequest(JSON.stringify({notMessage: 'value'}));

    try {
      await parseRequestBody(req);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RequestParseError);
      const parseError = err as RequestParseError;
      expect(parseError.statusCode).toBe(400);
      expect(parseError.errorBody.error).toBe(
        'Missing required field: message'
      );
    }
  });

  it('throws RequestParseError with 400 when message is not a string', async () => {
    const req = createMockRequest(JSON.stringify({message: 123}));

    try {
      await parseRequestBody(req);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RequestParseError);
      const parseError = err as RequestParseError;
      expect(parseError.statusCode).toBe(400);
      expect(parseError.errorBody.error).toBe(
        'Missing required field: message'
      );
    }
  });

  it('throws RequestParseError with 400 when body is an empty string', async () => {
    const req = createMockRequest('');

    try {
      await parseRequestBody(req);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RequestParseError);
      const parseError = err as RequestParseError;
      expect(parseError.statusCode).toBe(400);
      expect(parseError.errorBody.error).toBe('Invalid JSON');
    }
  });

  it('throws RequestParseError with 400 when body is null JSON', async () => {
    const req = createMockRequest('null');

    try {
      await parseRequestBody(req);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RequestParseError);
      const parseError = err as RequestParseError;
      expect(parseError.statusCode).toBe(400);
      expect(parseError.errorBody.error).toBe(
        'Missing required field: message'
      );
    }
  });

  it('accepts message with empty string value', async () => {
    const req = createMockRequest(JSON.stringify({message: ''}));
    const result = await parseRequestBody(req);
    expect(result).toEqual({message: ''});
  });
});
