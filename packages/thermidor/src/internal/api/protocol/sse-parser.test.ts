import {describe, it, expect} from 'vitest';
import fc from 'fast-check';
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

  describe('CUSTOM event edge cases (fallback path)', () => {
    it('preserves trimmed name when CUSTOM event passes schema validation', () => {
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

  describe('Property 4: SSE parser preserves CUSTOM event name and value', () => {
    /**
     * Validates: Requirements 4.1, 4.4
     *
     * For any well-formed SSE frame with type "CUSTOM", a non-empty name string,
     * and a JSON-serializable value, parseSSEEvent produces a NormalizedStreamEvent
     * with type === 'CUSTOM', name preserved exactly as provided (Zod passes
     * validation without trimming), and value deeply equal to the original.
     */
    it('preserves name exactly and value deeply for any valid CUSTOM event', () => {
      fc.assert(
        fc.property(
          fc.string({minLength: 1}),
          fc.jsonValue(),
          (generatedName, generatedValue) => {
            const raw = {
              event: 'message',
              data: JSON.stringify({
                type: 'CUSTOM',
                name: generatedName,
                value: generatedValue,
              }),
            };

            const result = parseSSEEvent(raw);

            const expectedValue = JSON.parse(JSON.stringify(generatedValue));

            expect(result).toHaveProperty('type', 'CUSTOM');
            expect(result).toHaveProperty('name', generatedName);
            expect(result).toHaveProperty('value');
            expect((result as {value: unknown}).value).toEqual(expectedValue);
          }
        ),
        {numRuns: 100}
      );
    });
  });

  describe('Property 5: SSE parser fallback always produces valid CustomEvent', () => {
    /**
     * Validates: Requirements 4.2, 4.3, 4.5
     *
     * For any SSE frame with type "CUSTOM" that fails AG-UI schema validation
     * (name is non-string), parseSSEEvent always produces a NormalizedStreamEvent
     * with type === 'CUSTOM', name defaulted to 'custom', and value resolved from
     * the value field, payload field, or entire record.
     */
    const invalidNameArb = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.integer(),
      fc.boolean(),
      fc.constant([]),
      fc.constant({})
    );

    it('always produces type CUSTOM with default name when name is non-string', () => {
      fc.assert(
        fc.property(
          invalidNameArb,
          fc.jsonValue(),
          (invalidName, generatedValue) => {
            const payload: Record<string, unknown> = {
              type: 'CUSTOM',
              value: generatedValue,
            };
            if (invalidName !== undefined) {
              payload.name = invalidName;
            }

            const raw = {
              event: 'message',
              data: JSON.stringify(payload),
            };

            const result = parseSSEEvent(raw) as {
              type: string;
              name: string;
              value: unknown;
            };

            const expectedValue = JSON.parse(JSON.stringify(generatedValue));

            expect(result.type).toBe('CUSTOM');
            expect(result.name).toBe('custom');
            expect(result.value).toEqual(expectedValue);
          }
        ),
        {numRuns: 100}
      );
    });

    it('falls back to payload field when value is absent', () => {
      fc.assert(
        fc.property(
          invalidNameArb,
          fc.jsonValue(),
          (invalidName, generatedPayload) => {
            const payload: Record<string, unknown> = {
              type: 'CUSTOM',
              payload: generatedPayload,
            };
            if (invalidName !== undefined) {
              payload.name = invalidName;
            }

            const raw = {
              event: 'message',
              data: JSON.stringify(payload),
            };

            const result = parseSSEEvent(raw) as {
              type: string;
              name: string;
              value: unknown;
            };

            const expectedPayload = JSON.parse(
              JSON.stringify(generatedPayload)
            );

            expect(result.type).toBe('CUSTOM');
            expect(result.name).toBe('custom');
            expect(result.value).toEqual(expectedPayload);
          }
        ),
        {numRuns: 100}
      );
    });

    it('falls back to entire record when neither value nor payload is present', () => {
      fc.assert(
        fc.property(
          invalidNameArb,
          fc.dictionary(
            fc.string({minLength: 1, maxLength: 10}),
            fc.jsonValue()
          ),
          (invalidName, extraFields) => {
            const payload: Record<string, unknown> = {
              ...extraFields,
              type: 'CUSTOM',
            };
            delete payload.value;
            delete payload.payload;
            if (invalidName !== undefined) {
              payload.name = invalidName;
            }

            const raw = {
              event: 'message',
              data: JSON.stringify(payload),
            };

            const result = parseSSEEvent(raw) as {
              type: string;
              name: string;
              value: unknown;
            };

            const expectedPayload = JSON.parse(JSON.stringify(payload));

            expect(result.type).toBe('CUSTOM');
            expect(result.name).toBe('custom');
            expect(result.value).toEqual(expectedPayload);
          }
        ),
        {numRuns: 100}
      );
    });
  });
});
