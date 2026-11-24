import {type BaseEvent, EventType} from '@ag-ui/core';
import {describe, expect, it} from 'vitest';
import {createChunkExpander} from './chunk-expander.js';

const expandAll = (events: object[]) => {
  const expand = createChunkExpander();
  return events.flatMap((event) => expand(event as BaseEvent));
};

describe('#createChunkExpander', () => {
  it('passes regular events through', () => {
    const events = [
      {type: EventType.RUN_STARTED, runId: 'r1', threadId: 't1'},
      {type: EventType.TEXT_MESSAGE_CONTENT, messageId: 'm1', delta: 'Hi'},
    ];

    expect(expandAll(events)).toEqual(events);
  });

  it('expands text message chunks into start, content and end events', () => {
    const events = expandAll([
      {type: EventType.TEXT_MESSAGE_CHUNK, messageId: 'm1', delta: 'Hello'},
      {type: EventType.TEXT_MESSAGE_CHUNK, messageId: 'm1', delta: ' world'},
      {type: EventType.TEXT_MESSAGE_CHUNK, delta: '!'},
      {type: EventType.STEP_FINISHED, stepName: 'Answering'},
    ]);

    expect(events).toEqual([
      {type: EventType.TEXT_MESSAGE_START, messageId: 'm1', role: 'assistant'},
      {type: EventType.TEXT_MESSAGE_CONTENT, messageId: 'm1', delta: 'Hello'},
      {type: EventType.TEXT_MESSAGE_CONTENT, messageId: 'm1', delta: ' world'},
      {type: EventType.TEXT_MESSAGE_CONTENT, messageId: 'm1', delta: '!'},
      {type: EventType.TEXT_MESSAGE_END, messageId: 'm1'},
      {type: EventType.STEP_FINISHED, stepName: 'Answering'},
    ]);
  });

  it('starts a new text message when the chunk message id changes', () => {
    const events = expandAll([
      {type: EventType.TEXT_MESSAGE_CHUNK, messageId: 'm1', delta: 'a'},
      {type: EventType.TEXT_MESSAGE_CHUNK, messageId: 'm2', delta: 'b'},
    ]);

    expect(events.map(({type}) => type)).toEqual([
      EventType.TEXT_MESSAGE_START,
      EventType.TEXT_MESSAGE_CONTENT,
      EventType.TEXT_MESSAGE_END,
      EventType.TEXT_MESSAGE_START,
      EventType.TEXT_MESSAGE_CONTENT,
    ]);
  });

  it('keeps the chunk role and name on the start event', () => {
    const [start] = expandAll([
      {type: EventType.TEXT_MESSAGE_CHUNK, messageId: 'm1', role: 'user', name: 'bob'},
    ]);

    expect(start).toEqual({
      type: EventType.TEXT_MESSAGE_START,
      messageId: 'm1',
      role: 'user',
      name: 'bob',
    });
  });

  it('expands tool call chunks into start, args and end events', () => {
    const events = expandAll([
      {
        type: EventType.TOOL_CALL_CHUNK,
        toolCallId: 'tc1',
        toolCallName: 'search',
        parentMessageId: 'm1',
        delta: '{"q":',
      },
      {type: EventType.TOOL_CALL_CHUNK, delta: '"test"}'},
      {type: EventType.RUN_FINISHED, runId: 'r1', threadId: 't1'},
    ]);

    expect(events).toEqual([
      {
        type: EventType.TOOL_CALL_START,
        toolCallId: 'tc1',
        toolCallName: 'search',
        parentMessageId: 'm1',
      },
      {type: EventType.TOOL_CALL_ARGS, toolCallId: 'tc1', delta: '{"q":'},
      {type: EventType.TOOL_CALL_ARGS, toolCallId: 'tc1', delta: '"test"}'},
      {type: EventType.TOOL_CALL_END, toolCallId: 'tc1'},
      {type: EventType.RUN_FINISHED, runId: 'r1', threadId: 't1'},
    ]);
  });

  it('closes an open tool call when a text message chunk arrives', () => {
    const events = expandAll([
      {type: EventType.TOOL_CALL_CHUNK, toolCallId: 'tc1', toolCallName: 'search'},
      {type: EventType.TEXT_MESSAGE_CHUNK, messageId: 'm1', delta: 'a'},
    ]);

    expect(events.map(({type}) => type)).toEqual([
      EventType.TOOL_CALL_START,
      EventType.TOOL_CALL_END,
      EventType.TEXT_MESSAGE_START,
      EventType.TEXT_MESSAGE_CONTENT,
    ]);
  });

  it('keeps the chunk stream open across raw events', () => {
    const events = expandAll([
      {type: EventType.TEXT_MESSAGE_CHUNK, messageId: 'm1', delta: 'a'},
      {type: EventType.RAW, event: {}},
      {type: EventType.TEXT_MESSAGE_CHUNK, delta: 'b'},
    ]);

    expect(events.map(({type}) => type)).toEqual([
      EventType.TEXT_MESSAGE_START,
      EventType.TEXT_MESSAGE_CONTENT,
      EventType.RAW,
      EventType.TEXT_MESSAGE_CONTENT,
    ]);
  });

  it('throws when the first text message chunk has no message id', () => {
    expect(() => expandAll([{type: EventType.TEXT_MESSAGE_CHUNK, delta: 'a'}])).toThrow(
      'First TEXT_MESSAGE_CHUNK must have a messageId'
    );
  });

  it('throws when the first tool call chunk has no id or name', () => {
    expect(() => expandAll([{type: EventType.TOOL_CALL_CHUNK, toolCallName: 'search'}])).toThrow(
      'First TOOL_CALL_CHUNK must have a toolCallId'
    );
    expect(() => expandAll([{type: EventType.TOOL_CALL_CHUNK, toolCallId: 'tc1'}])).toThrow(
      'First TOOL_CALL_CHUNK must have a toolCallName'
    );
  });
});
