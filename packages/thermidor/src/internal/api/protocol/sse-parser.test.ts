import {describe, it, expect} from 'vitest';
import {parseSSEEvent} from './sse-parser.js';

describe('parseSSEEvent', () => {
  it('parses JSON data into typed event', () => {
    const result = parseSSEEvent({
      event: 'message',
      data: JSON.stringify({
        type: 'TEXT_MESSAGE_CONTENT',
        messageId: 'm1',
        delta: 'hi',
      }),
    });

    expect(result).toEqual({
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'm1',
      delta: 'hi',
    });
  });

  it('returns UNKNOWN for non-JSON data', () => {
    const result = parseSSEEvent({event: 'message', data: 'plain text'});

    expect(result).toEqual({
      type: 'UNKNOWN',
      event: 'message',
      payload: 'plain text',
    });
  });

  it('returns UNKNOWN for empty data', () => {
    const result = parseSSEEvent({event: 'message', data: ''});

    expect(result).toEqual({
      type: 'UNKNOWN',
      event: 'message',
      payload: '',
    });
  });

  it('promotes named SSE event without type to typed event', () => {
    const result = parseSSEEvent({
      event: 'turn_started',
      data: JSON.stringify({conversationSessionId: 'abc'}),
    });

    expect(result).toEqual({
      type: 'turn_started',
      conversationSessionId: 'abc',
    });
  });

  it('handles CUSTOM event type', () => {
    const result = parseSSEEvent({
      event: 'message',
      data: JSON.stringify({type: 'CUSTOM', name: 'myEvent', value: 42}),
    });

    expect(result).toEqual({type: 'CUSTOM', name: 'myEvent', value: 42});
  });

  it('never throws on malformed JSON', () => {
    const result = parseSSEEvent({event: 'error', data: '{invalid'});

    expect(result.type).toBe('error');
  });

  it('handles object payload without type as UNKNOWN for message event', () => {
    const result = parseSSEEvent({
      event: 'message',
      data: JSON.stringify({foo: 'bar'}),
    });

    expect(result).toEqual({
      type: 'UNKNOWN',
      event: 'message',
      payload: {foo: 'bar'},
    });
  });

  it('promotes commerce_search_api_response named SSE event', () => {
    const content = {products: [], pagination: {totalEntries: 0}, facets: []};
    const result = parseSSEEvent({
      event: 'commerce_search_api_response',
      data: JSON.stringify({content}),
    });

    expect(result).toEqual({
      type: 'commerce_search_api_response',
      content,
    });
  });
});
