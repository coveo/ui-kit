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

  describe('named SSE event for routed search', () => {
    it('promotes commerce-search-api-response named event with payload spread', () => {
      const result = parseSSEEvent({
        event: 'commerce-search-api-response',
        data: JSON.stringify({
          products: [{permanentid: 'p1'}],
          pagination: {totalEntries: 1},
        }),
      });

      expect(result).toEqual({
        type: 'commerce-search-api-response',
        products: [{permanentid: 'p1'}],
        pagination: {totalEntries: 1},
      });
    });

    it('promotes search-api-response named event with payload spread', () => {
      const result = parseSSEEvent({
        event: 'search-api-response',
        data: JSON.stringify({
          results: [{uniqueId: 'r1', title: 'Result'}],
          totalCount: 1,
        }),
      });

      expect(result).toEqual({
        type: 'search-api-response',
        results: [{uniqueId: 'r1', title: 'Result'}],
        totalCount: 1,
      });
    });

    it('preserves deeply nested payload fields', () => {
      const result = parseSSEEvent({
        event: 'commerce-search-api-response',
        data: JSON.stringify({
          products: [{permanentid: 'p1', nested: {deep: {value: true}}}],
          queryCorrection: {correctedQuery: 'fixed query'},
        }),
      });

      expect(result).toHaveProperty('type', 'commerce-search-api-response');
      expect(result).toHaveProperty('products[0].nested.deep.value', true);
      expect(result).toHaveProperty(
        'queryCorrection.correctedQuery',
        'fixed query'
      );
    });
  });

  describe('CUSTOM event edge cases (fallback path)', () => {
    it('preserves name when CUSTOM event passes schema validation', () => {
      const result = parseSSEEvent({
        event: 'message',
        data: JSON.stringify({
          type: 'CUSTOM',
          name: '  commerce-search  ',
          value: {products: []},
        }),
      });

      expect(result).toHaveProperty('type', 'CUSTOM');
      expect(result).toHaveProperty('name', '  commerce-search  ');
      expect(result).toHaveProperty('value', {products: []});
    });

    it('defaults name to "custom" when name is null', () => {
      const result = parseSSEEvent({
        event: 'message',
        data: JSON.stringify({type: 'CUSTOM', name: null, value: 'data'}),
      });

      expect(result).toEqual({
        type: 'CUSTOM',
        name: 'custom',
        value: 'data',
      });
    });

    it('defaults name to "custom" when name is missing', () => {
      const result = parseSSEEvent({
        event: 'message',
        data: JSON.stringify({type: 'CUSTOM', value: 'data'}),
      });

      expect(result).toEqual({
        type: 'CUSTOM',
        name: 'custom',
        value: 'data',
      });
    });

    it('defaults name to "custom" when name is a non-string type', () => {
      const result = parseSSEEvent({
        event: 'message',
        data: JSON.stringify({type: 'CUSTOM', name: 123, value: [1, 2, 3]}),
      });

      expect(result).toEqual({
        type: 'CUSTOM',
        name: 'custom',
        value: [1, 2, 3],
      });
    });

    it('uses payload field when value is absent', () => {
      const result = parseSSEEvent({
        event: 'message',
        data: JSON.stringify({
          type: 'CUSTOM',
          name: null,
          payload: {items: [1, 2, 3]},
        }),
      });

      expect(result).toEqual({
        type: 'CUSTOM',
        name: 'custom',
        value: {items: [1, 2, 3]},
      });
    });

    it('uses entire parsed object when neither value nor payload is present', () => {
      const result = parseSSEEvent({
        event: 'message',
        data: JSON.stringify({type: 'CUSTOM', name: null, extra: 'field'}),
      });

      expect(result).toEqual({
        type: 'CUSTOM',
        name: 'custom',
        value: {type: 'CUSTOM', name: null, extra: 'field'},
      });
    });

    it('produces type CUSTOM even when AG-UI schema validation fails', () => {
      const result = parseSSEEvent({
        event: 'message',
        data: JSON.stringify({
          type: 'CUSTOM',
          name: 123,
          value: {nested: {deeply: true}},
        }),
      });

      expect(result.type).toBe('CUSTOM');
      expect(result).toHaveProperty('name', 'custom');
      expect(result).toHaveProperty('value', {nested: {deeply: true}});
    });
  });
});
