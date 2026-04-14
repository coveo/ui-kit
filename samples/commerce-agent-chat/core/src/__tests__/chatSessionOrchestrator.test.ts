import type {BaseEvent} from '@ag-ui/client';
import {Subject} from 'rxjs';
import {describe, expect, it, vi} from 'vitest';

import type {CommerceConfig} from '../config/env.js';
import {ChatSessionOrchestrator} from '../lib/chatSessionOrchestrator.js';
import type {Message} from '../types/agent.js';

describe('ChatSessionOrchestrator', () => {
  const mockConfig: CommerceConfig = {
    agentMode: 'local',
    agentUrl: 'http://localhost:8080',
    orgId: 'test-org',
    accessToken: 'test-token',
    platformUrl: 'https://platform.cloud.coveo.com',
    trackingId: 'test-tracking',
    language: 'en',
    country: 'US',
    currency: 'USD',
    timezone: 'America/Montreal',
    clientId: 'test-client-id',
    contextUrl: 'https://example.com',
  };

  it('sends message and applies streamed text updates', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn((_: Message[], __: string) => ({
      runId: 'run-1',
      events: stream.asObservable(),
    }));

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});
    const updates: Array<{content: string; isLoading: boolean}> = [];

    const unsubscribe = orchestrator.subscribe(({state}) => {
      const assistant = [...state.messages]
        .reverse()
        .find((m) => m.role === 'assistant');
      updates.push({
        content: assistant?.content ?? '',
        isLoading: state.isLoading,
      });
    });

    orchestrator.sendMessage('Hello');

    expect(invoke).toHaveBeenCalledTimes(1);
    const call = invoke.mock.calls[0];
    const sentMessages = call[0];
    expect(sentMessages[sentMessages.length - 1].content).toBe('Hello');

    stream.next({type: 'TEXT_MESSAGE_START'} as never);
    stream.next({type: 'TEXT_MESSAGE_CONTENT', delta: 'Hi'} as never);
    stream.next({type: 'TEXT_MESSAGE_CONTENT', delta: ' there'} as never);
    stream.complete();

    const finalState = orchestrator.getState();
    const finalAssistant =
      [...finalState.messages].reverse().find((m) => m.role === 'assistant')
        ?.content ?? '';

    expect(finalAssistant).toBe('Hi there');
    expect(finalState.isLoading).toBe(false);

    unsubscribe();
    orchestrator.dispose();
  });

  it('ignores message text chunks that arrive before TEXT_MESSAGE_START', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn((_: Message[], __: string) => ({
      runId: 'run-1',
      events: stream.asObservable(),
    }));

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});

    orchestrator.sendMessage('Hello');
    stream.next({
      type: 'TEXT_MESSAGE_CONTENT',
      delta: 'Reasoning text',
    } as never);
    stream.next({type: 'TEXT_MESSAGE_START'} as never);
    stream.next({type: 'TEXT_MESSAGE_CONTENT', delta: 'Final answer'} as never);
    stream.complete();

    const finalAssistant =
      [...orchestrator.getState().messages]
        .reverse()
        .find((m) => m.role === 'assistant')?.content ?? '';

    expect(finalAssistant).toBe('Final answer');

    orchestrator.dispose();
  });

  it('appends progress steps immediately when streamed events arrive', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn((_: Message[], __: string) => ({
      runId: 'run-1',
      events: stream.asObservable(),
    }));

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});
    const immediates: boolean[] = [];

    const unsubscribe = orchestrator.subscribe((update) => {
      if (update.immediate !== undefined) {
        immediates.push(Boolean(update.immediate));
      }
    });

    orchestrator.sendMessage('Hello');
    stream.next({type: 'REASONING_START'} as never);
    stream.next({type: 'TOOL_CALL_START', toolCallName: 'search'} as never);

    const state = orchestrator.getState();
    expect(state.progressSteps).toContain('Reasoning...');
    expect(state.progressSteps).toContain('Tool: search');
    expect(immediates).toContain(true);

    unsubscribe();
    orchestrator.dispose();
  });

  it('collapses repeated reasoning progress into a single step', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn((_: Message[], __: string) => ({
      runId: 'run-1',
      events: stream.asObservable(),
    }));

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});

    orchestrator.sendMessage('Hello');
    stream.next({type: 'REASONING_START'} as never);
    stream.next({type: 'REASONING_START'} as never);
    stream.next({type: 'REASONING_START'} as never);

    expect(orchestrator.getState().progressSteps).toEqual(['Reasoning...']);

    orchestrator.dispose();
  });

  it('aggregates adjacent reasoning trace entries into one item', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn((_: Message[], __: string) => ({
      runId: 'run-1',
      events: stream.asObservable(),
    }));

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});

    orchestrator.sendMessage('Hello');
    stream.next({type: 'REASONING_MESSAGE_START', messageId: 'r1'} as never);
    stream.next({
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'r1',
      delta: 'A',
    } as never);
    stream.next({type: 'REASONING_MESSAGE_END', messageId: 'r1'} as never);
    stream.next({type: 'REASONING_MESSAGE_START', messageId: 'r2'} as never);
    stream.next({
      type: 'REASONING_MESSAGE_CONTENT',
      messageId: 'r2',
      delta: 'B',
    } as never);

    const trace = orchestrator.getState().progressTrace;
    expect(trace).toHaveLength(1);
    expect(trace[0]).toMatchObject({
      kind: 'reasoning',
      text: 'AB',
      status: 'streaming',
    });

    orchestrator.dispose();
  });

  it('collapses repeated identical tool progress into a single step', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn((_: Message[], __: string) => ({
      runId: 'run-1',
      events: stream.asObservable(),
    }));

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});

    orchestrator.sendMessage('Hello');
    stream.next({type: 'TOOL_CALL_START', toolCallName: 'search'} as never);
    stream.next({type: 'TOOL_CALL_START', toolCallName: 'search'} as never);

    expect(orchestrator.getState().progressSteps).toEqual(['Tool: search']);

    orchestrator.dispose();
  });

  it('preserves progress steps and appends completion status when stream completes', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn((_: Message[], __: string) => ({
      runId: 'run-1',
      events: stream.asObservable(),
    }));

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});

    orchestrator.sendMessage('Hello');
    stream.next({type: 'REASONING_START'} as never);
    stream.complete();

    expect(orchestrator.getState().progressSteps).toEqual([
      'Reasoning...',
      'Response complete',
    ]);

    orchestrator.dispose();
  });

  it('appends Done on RUN_FINISHED and does not append Response complete afterwards', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn((_: Message[], __: string) => ({
      runId: 'run-1',
      events: stream.asObservable(),
    }));

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});

    orchestrator.sendMessage('Hello');
    stream.next({type: 'REASONING_START'} as never);
    stream.next({type: 'RUN_FINISHED'} as never);
    stream.complete();

    expect(orchestrator.getState().progressSteps).toEqual([
      'Reasoning...',
      'Done',
    ]);

    orchestrator.dispose();
  });

  it('clearMessages resets conversation and creates a new thread id', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn((_: Message[], __: string) => ({
      runId: 'run-1',
      events: stream.asObservable(),
    }));

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});
    const originalThreadId = orchestrator.getState().threadId;

    orchestrator.sendMessage('Hello');
    orchestrator.clearMessages();

    const state = orchestrator.getState();
    expect(state.messages).toEqual([]);
    expect(state.threadId).not.toBe(originalThreadId);
    expect(state.isLoading).toBe(false);

    orchestrator.dispose();
  });

  it('stores streamed thread state and forwards it on the next turn', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn(
      (_: Message[], __: string, ___?: Record<string, unknown>) => ({
        runId: 'run-1',
        events: stream.asObservable(),
      })
    );

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});

    orchestrator.sendMessage('Find shoes');
    stream.next({
      type: 'STATE_SNAPSHOT',
      snapshot: {conversation: {lastIntent: 'search'}},
    } as never);
    stream.complete();

    const nextStream = new Subject<BaseEvent>();
    invoke.mockReturnValueOnce({
      runId: 'run-2',
      events: nextStream.asObservable(),
    });

    orchestrator.sendMessage('Only red ones');

    expect(invoke).toHaveBeenNthCalledWith(
      2,
      expect.any(Array),
      orchestrator.getState().threadId,
      {conversation: {lastIntent: 'search'}}
    );

    nextStream.complete();

    orchestrator.dispose();
  });

  it('clearMessages resets stored thread state before the next turn', () => {
    const firstStream = new Subject<BaseEvent>();
    const invoke = vi.fn(
      (_: Message[], __: string, ___?: Record<string, unknown>) => ({
        runId: 'run-1',
        events: firstStream.asObservable(),
      })
    );

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});

    orchestrator.sendMessage('Find shoes');
    firstStream.next({
      type: 'STATE_SNAPSHOT',
      snapshot: {conversation: {lastIntent: 'search'}},
    } as never);
    firstStream.complete();

    orchestrator.clearMessages();

    const secondStream = new Subject<BaseEvent>();
    invoke.mockReturnValueOnce({
      runId: 'run-2',
      events: secondStream.asObservable(),
    });

    orchestrator.sendMessage('Start over');

    expect(invoke).toHaveBeenNthCalledWith(
      2,
      expect.any(Array),
      orchestrator.getState().threadId,
      {}
    );

    secondStream.complete();

    orchestrator.dispose();
  });

  it('marks streamed activities as backend owned', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn(
      (_: Message[], __: string, ___?: Record<string, unknown>) => ({
        runId: 'run-1',
        events: stream.asObservable(),
      })
    );

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});

    orchestrator.sendMessage('Find surfboards');
    stream.next({
      type: 'ACTIVITY_SNAPSHOT',
      messageId: 'act-1',
      activityType: 'a2ui-surface',
      content: {operations: []},
    } as never);
    stream.complete();

    expect(orchestrator.getActivityOwner('act-1')).toBe('backend');

    orchestrator.dispose();
  });

  it('allows explicit ownership handoff to client', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn(
      (_: Message[], __: string, ___?: Record<string, unknown>) => ({
        runId: 'run-1',
        events: stream.asObservable(),
      })
    );

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});

    orchestrator.sendMessage('Find surfboards');
    stream.next({
      type: 'ACTIVITY_SNAPSHOT',
      messageId: 'act-2',
      activityType: 'a2ui-surface',
      content: {operations: []},
    } as never);
    orchestrator.setActivityOwner('act-2', 'client');

    expect(orchestrator.getActivityOwner('act-2')).toBe('client');

    stream.complete();
    orchestrator.dispose();
  });
});
