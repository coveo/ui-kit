/* oxlint-disable @typescript-eslint/no-explicit-any -- unit test */

import type {AgentSubscriber} from '@ag-ui/client';
import type {Dispatch} from '@reduxjs/toolkit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  setFollowUpAnswersConversationId,
  setFollowUpAnswersConversationToken,
  setIsEnabled,
} from '../../../../../features/follow-up-answers/follow-up-answers-actions.js';
import {
  finishStep,
  finishToolCall,
  setAnswerContentFormat,
  setAnswerId,
  setCannotAnswer,
  setIsAnswerGenerated,
  setIsLoading,
  setIsStreaming,
  startStep,
  startToolCall,
  toolCallArgs,
  updateCitations,
  updateError,
  updateMessage,
} from '../../../../../features/generated-answer/generated-answer-actions.js';
import * as generatedAnswerAnalyticsActions from '../../../../../features/generated-answer/generated-answer-analytics-actions.js';
import {GeneratedAnswerSseErrorCode} from '../../../../../features/generated-answer/sse-generated-answer-errors.js';
import {createHeadAnswerStrategy} from './head-answer-strategy.js';

describe('createHeadAnswerStrategy', () => {
  let dispatch: ReturnType<typeof vi.fn> & Dispatch;
  let strategy: AgentSubscriber;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    dispatch = vi.fn() as unknown as ReturnType<typeof vi.fn> & Dispatch;
    strategy = createHeadAnswerStrategy(dispatch);
  });

  it('initializes identifiers and streaming state when a run starts', () => {
    strategy.onRunStartedEvent!({
      event: {runId: 'run-001', threadId: 'thread-007'},
    } as any);

    expect(dispatch).toHaveBeenCalledWith(setAnswerId('run-001'));
    expect(dispatch).toHaveBeenCalledWith(setIsLoading(false));
    expect(dispatch).toHaveBeenCalledWith(setIsStreaming(true));
    expect(dispatch).toHaveBeenCalledWith(
      setFollowUpAnswersConversationId('thread-007')
    );
  });

  it('dispatches a new generation step start when a step starts', () => {
    strategy.onStepStartedEvent!({
      event: {stepName: 'searching', timestamp: 123},
      agent: {isRunning: true},
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      startStep({name: 'searching', startedAt: 123})
    );
  });

  it('records the completion of a generation step and falls back to Date.now()', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(456);

    strategy.onStepFinishedEvent!({
      event: {stepName: 'answering'},
      agent: {isRunning: true},
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      finishStep({name: 'answering', finishedAt: 456})
    );

    nowSpy.mockRestore();
  });

  it('appends incoming text deltas to the answer message', () => {
    strategy.onTextMessageContentEvent!({
      event: {delta: 'Hello'},
      agent: {isRunning: true},
    } as any);

    expect(dispatch).toHaveBeenCalledWith(updateMessage({textDelta: 'Hello'}));
  });

  it('handles header metadata by dispatching the relevant updates', () => {
    strategy.onCustomEvent!({
      event: {
        name: 'header',
        value: {
          contentFormat: 'text/markdown',
          followUpEnabled: true,
          conversationToken: 'token-123',
        },
      },
      agent: {isRunning: true},
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      setAnswerContentFormat('text/markdown')
    );
    expect(dispatch).toHaveBeenCalledWith(setIsEnabled(true));
    expect(dispatch).toHaveBeenCalledWith(
      setFollowUpAnswersConversationToken('token-123')
    );
  });

  it('updates citations when the server sends citation data', () => {
    const citations = [
      {
        id: 'doc-1',
        title: 'Document',
        uri: 'https://example.com/doc-1',
        permanentid: 'permanent-doc-1',
        clickUri: 'https://example.com/click/doc-1',
        source: 'Example Source',
      },
    ];

    strategy.onCustomEvent!({
      event: {
        name: 'citations',
        value: {citations},
      },
      agent: {isRunning: true},
    } as any);

    expect(dispatch).toHaveBeenCalledWith(updateCitations({citations}));
  });

  it('records errors and normalizes error codes', () => {
    strategy.onRunErrorEvent!({
      event: {
        message: 'Something went wrong',
        code: 'KNOWLEDGE:SSE_MAX_DURATION_EXCEEDED',
      },
      agent: {isRunning: true},
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      updateError({
        message: 'Something went wrong',
        code: GeneratedAnswerSseErrorCode.SseMaxDurationExceeded,
      })
    );
  });

  it('finalizes the run with the answer generation result', () => {
    const streamEndAction = vi.fn() as any;
    const responseLinkedAction = vi.fn() as any;
    const streamEndSpy = vi
      .spyOn(generatedAnswerAnalyticsActions, 'logGeneratedAnswerStreamEnd')
      .mockReturnValue(streamEndAction);
    vi.spyOn(
      generatedAnswerAnalyticsActions,
      'logGeneratedAnswerResponseLinked'
    ).mockReturnValue(responseLinkedAction);
    strategy = createHeadAnswerStrategy(dispatch);
    strategy.onRunStartedEvent!({
      event: {runId: 'run-001', threadId: 'thread-007'},
    } as any);
    vi.clearAllMocks();

    strategy.onRunFinishedEvent!({
      event: {
        result: {
          completionReason: 'ANSWERED',
        },
        threadId: 'thread-007',
      },
      agent: {isRunning: true},
    } as any);

    expect(dispatch).toHaveBeenNthCalledWith(1, setIsAnswerGenerated(true));
    expect(dispatch).toHaveBeenNthCalledWith(2, setCannotAnswer(false));
    expect(dispatch).toHaveBeenNthCalledWith(3, setIsStreaming(false));
    expect(streamEndSpy).toHaveBeenCalledWith(true, 'run-001', true);
    expect(dispatch).toHaveBeenNthCalledWith(4, streamEndAction);
    expect(dispatch).toHaveBeenNthCalledWith(5, responseLinkedAction);
  });

  it('disables answer flags when no answer was generated', () => {
    const streamEndAction = vi.fn() as any;
    const responseLinkedAction = vi.fn() as any;
    const streamEndSpy = vi
      .spyOn(generatedAnswerAnalyticsActions, 'logGeneratedAnswerStreamEnd')
      .mockReturnValue(streamEndAction);
    vi.spyOn(
      generatedAnswerAnalyticsActions,
      'logGeneratedAnswerResponseLinked'
    ).mockReturnValue(responseLinkedAction);
    strategy = createHeadAnswerStrategy(dispatch);
    strategy.onRunStartedEvent!({
      event: {runId: 'run-001', threadId: 'thread-007'},
    } as any);
    vi.clearAllMocks();

    strategy.onRunFinishedEvent!({
      event: {
        result: {
          completionReason: 'NO_RESULTS',
        },
        threadId: 'thread-007',
      },
      agent: {isRunning: true},
    } as any);

    expect(dispatch).toHaveBeenNthCalledWith(1, setIsAnswerGenerated(false));
    expect(dispatch).toHaveBeenNthCalledWith(2, setCannotAnswer(true));
    expect(dispatch).toHaveBeenNthCalledWith(3, setIsStreaming(false));
    expect(streamEndSpy).toHaveBeenCalledWith(false, 'run-001', undefined);
    expect(dispatch).toHaveBeenNthCalledWith(4, streamEndAction);
    expect(dispatch).toHaveBeenNthCalledWith(5, responseLinkedAction);
  });

  describe('tool call handlers', () => {
    it('dispatches startToolCall when a tool call starts', () => {
      strategy.onToolCallStartEvent!({
        event: {toolCallName: 'search', toolCallId: 'tc-1', timestamp: 100},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        startToolCall({
          toolCallName: 'search',
          toolCallId: 'tc-1',
          startedAt: 100,
        })
      );
    });

    it('dispatches startToolCall with Date.now() when timestamp is missing', () => {
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(999);

      strategy.onToolCallStartEvent!({
        event: {toolCallName: 'search', toolCallId: 'tc-2'},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        startToolCall({
          toolCallName: 'search',
          toolCallId: 'tc-2',
          startedAt: 999,
        })
      );

      nowSpy.mockRestore();
    });

    it('dispatches finishToolCall when a tool call ends', () => {
      strategy.onToolCallEndEvent!({
        event: {toolCallId: 'tc-1', timestamp: 200},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        finishToolCall({toolCallId: 'tc-1', finishedAt: 200})
      );
    });

    it('dispatches finishToolCall with Date.now() when timestamp is missing', () => {
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(888);

      strategy.onToolCallEndEvent!({
        event: {toolCallId: 'tc-1'},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        finishToolCall({toolCallId: 'tc-1', finishedAt: 888})
      );

      nowSpy.mockRestore();
    });

    it('dispatches toolCallArgs with type "search" when delta contains a q field', () => {
      strategy.onToolCallArgsEvent!({
        event: {toolCallId: 'tc-1', delta: '{"q":"test query"}'},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        toolCallArgs({
          toolCallId: 'tc-1',
          args: {q: 'test query'},
          type: 'search',
        })
      );
    });

    it('dispatches toolCallArgs with type "generic" when delta has no q field', () => {
      strategy.onToolCallArgsEvent!({
        event: {toolCallId: 'tc-1', delta: '{"foo":"bar"}'},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        toolCallArgs({
          toolCallId: 'tc-1',
          args: {raw: '{"foo":"bar"}'},
          type: 'generic',
        })
      );
    });

    it('dispatches toolCallArgs with type "generic" when delta is not valid JSON', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      strategy.onToolCallArgsEvent!({
        event: {toolCallId: 'tc-1', delta: 'not-json'},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        toolCallArgs({
          toolCallId: 'tc-1',
          args: {raw: 'not-json'},
          type: 'generic',
        })
      );

      warnSpy.mockRestore();
    });
  });

  describe('when agent.isRunning is false', () => {
    const stoppedAgent = {isRunning: false};

    it('does not dispatch on step started', () => {
      strategy.onStepStartedEvent!({
        event: {stepName: 'searching', timestamp: 123},
        agent: stoppedAgent,
      } as any);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch on step finished', () => {
      strategy.onStepFinishedEvent!({
        event: {stepName: 'answering', timestamp: 456},
        agent: stoppedAgent,
      } as any);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch on text message content', () => {
      strategy.onTextMessageContentEvent!({
        event: {delta: 'Hello'},
        agent: stoppedAgent,
      } as any);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch on custom event', () => {
      strategy.onCustomEvent!({
        event: {
          name: 'header',
          value: {contentFormat: 'text/markdown'},
        },
        agent: stoppedAgent,
      } as any);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch on run error', () => {
      strategy.onRunErrorEvent!({
        event: {
          message: 'Something went wrong',
          code: 'KNOWLEDGE:SSE_MAX_DURATION_EXCEEDED',
        },
        agent: stoppedAgent,
      } as any);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch on run finished', () => {
      strategy.onRunFinishedEvent!({
        event: {
          result: {completionReason: 'ANSWERED'},
          threadId: 'thread-007',
        },
        agent: stoppedAgent,
      } as any);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
