import {describe, expect, it} from 'vitest';

import {
  extractStreamingProgress,
  parseAgentEvent,
} from '../lib/streamParser.js';

describe('parseAgentEvent', () => {
  it('parses text stream events', () => {
    const parsed = parseAgentEvent({
      type: 'stream',
      data: 'Hello world',
    } as never);

    expect(parsed.type).toBe('message');
    expect(parsed.content).toBe('Hello world');
  });

  it('parses AG-UI uppercase text content events', () => {
    const parsed = parseAgentEvent({
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'msg-1',
      delta: 'Hi',
    } as never);

    expect(parsed.type).toBe('message');
    expect(parsed.content).toBe('Hi');
  });

  it('parses AG-UI text chunk events with payload', () => {
    const parsed = parseAgentEvent({
      type: 'TEXT_MESSAGE_CHUNK',
      payload: {delta: ' there'},
    } as never);

    expect(parsed.type).toBe('message');
    expect(parsed.content).toBe(' there');
  });

  it('parses legacy activity events as activity_snapshot', () => {
    const parsed = parseAgentEvent({
      type: 'activity',
      payload: {operations: [{type: 'surface', payload: {}}]},
    } as never);

    expect(parsed.type).toBe('activity_snapshot');
    expect(parsed.activitySnapshot).toBeDefined();
    expect(parsed.activitySnapshot?.activityType).toBe('a2ui-surface');
  });

  it('parses ACTIVITY_SNAPSHOT events with messageId, activityType and content', () => {
    const content = {operations: [{surfaceUpdate: {surfaceId: 'main'}}]};
    const parsed = parseAgentEvent({
      type: 'ACTIVITY_SNAPSHOT',
      messageId: 'msg-42',
      activityType: 'a2ui-surface',
      content,
    } as never);

    expect(parsed.type).toBe('activity_snapshot');
    expect(parsed.activitySnapshot?.messageId).toBe('msg-42');
    expect(parsed.activitySnapshot?.activityType).toBe('a2ui-surface');
    expect(parsed.activitySnapshot?.content).toEqual(content);
  });

  it('parses ACTIVITY_DELTA events with messageId, activityType and patch', () => {
    const patch = [{op: 'replace', path: '/operations/0', value: {}}];
    const parsed = parseAgentEvent({
      type: 'ACTIVITY_DELTA',
      messageId: 'msg-42',
      activityType: 'a2ui-surface',
      patch,
    } as never);

    expect(parsed.type).toBe('activity_delta');
    expect(parsed.activityDelta?.messageId).toBe('msg-42');
    expect(parsed.activityDelta?.activityType).toBe('a2ui-surface');
    expect(parsed.activityDelta?.patch).toEqual(patch);
  });

  it('parses error events', () => {
    const parsed = parseAgentEvent({
      type: 'error',
      error: 'Test error',
    } as never);

    expect(parsed.type).toBe('error');
    expect(parsed.error).toBe('Test error');
  });

  it('handles invalid event structures', () => {
    const parsed = parseAgentEvent(null as never);

    expect(parsed.type).toBe('error');
    expect(parsed.error).toBeDefined();
  });
});

describe('extractStreamingProgress', () => {
  it('returns Reasoning for REASONING_START', () => {
    expect(extractStreamingProgress({type: 'REASONING_START'} as never)).toBe(
      'Reasoning...'
    );
  });

  it('returns tool progress for TOOL_CALL_START', () => {
    expect(
      extractStreamingProgress({
        type: 'TOOL_CALL_START',
        toolCallName: 'search_products',
      } as never)
    ).toBe('Tool: search_products');
  });

  it('clears progress for REASONING_END and TOOL_CALL_END', () => {
    expect(
      extractStreamingProgress({type: 'REASONING_END'} as never)
    ).toBeNull();
    expect(
      extractStreamingProgress({type: 'TOOL_CALL_END'} as never)
    ).toBeNull();
  });

  it('ignores unrelated events', () => {
    expect(
      extractStreamingProgress({
        type: 'TEXT_MESSAGE_CONTENT',
        delta: 'hi',
      } as never)
    ).toBeUndefined();
  });
});
