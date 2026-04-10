import type {BaseEvent} from '@ag-ui/core';
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

  it('clears progress steps when stream completes', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn((_: Message[], __: string) => ({
      runId: 'run-1',
      events: stream.asObservable(),
    }));

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {invoke});

    orchestrator.sendMessage('Hello');
    stream.next({type: 'REASONING_START'} as never);
    stream.complete();

    expect(orchestrator.getState().progressSteps).toEqual([]);

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

  it('clearMessages asks client to clear previous thread state', () => {
    const stream = new Subject<BaseEvent>();
    const invoke = vi.fn((_: Message[], __: string) => ({
      runId: 'run-1',
      events: stream.asObservable(),
    }));
    const clearThreadState = vi.fn();

    const orchestrator = new ChatSessionOrchestrator(mockConfig, {
      invoke,
      clearThreadState,
    });
    const originalThreadId = orchestrator.getState().threadId;

    orchestrator.clearMessages();

    expect(clearThreadState).toHaveBeenCalledWith(originalThreadId);

    orchestrator.dispose();
  });
});
