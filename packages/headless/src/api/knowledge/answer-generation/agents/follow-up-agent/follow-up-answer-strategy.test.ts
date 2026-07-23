/* oxlint-disable @typescript-eslint/no-explicit-any -- unit test */

import type {AgentSubscriber} from '@ag-ui/client';
import type {Dispatch} from '@reduxjs/toolkit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  followUpCitationsReceived,
  followUpCompleted,
  followUpFailed,
  followUpMessageChunkReceived,
  followUpStepFinished,
  followUpStepStarted,
  followUpToolCallArgs,
  followUpToolCallFinished,
  followUpToolCallStarted,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpIsLoading,
  setFollowUpIsStreaming,
} from '../../../../../features/follow-up-answers/follow-up-answers-actions.js';
import {GeneratedAnswerSseErrorCode} from '../../../../../features/generated-answer/sse-generated-answer-errors.js';
import {createFollowUpStrategy} from './follow-up-answer-strategy.js';

describe('createFollowUpStrategy', () => {
  let dispatch: ReturnType<typeof vi.fn> & Dispatch;
  let strategy: AgentSubscriber;
  let analytics: {
    logGeneratedAnswerStreamEnd: ReturnType<typeof vi.fn>;
    logGeneratedAnswerResponseLinked: ReturnType<typeof vi.fn>;
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const runId = 'run-123';

  beforeEach(() => {
    dispatch = vi.fn() as unknown as ReturnType<typeof vi.fn> & Dispatch;
    analytics = {
      logGeneratedAnswerStreamEnd: vi.fn(),
      logGeneratedAnswerResponseLinked: vi.fn(),
    };
    strategy = createFollowUpStrategy(dispatch, analytics as any);
    strategy.onRunStartedEvent!({event: {runId}} as any);
    vi.clearAllMocks();
  });

  it('tracks the active follow-up answer and toggles loading flags when a run starts', () => {
    strategy.onRunStartedEvent!({event: {runId}} as any);

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      setActiveFollowUpAnswerId(runId)
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      setFollowUpIsLoading({answerId: runId, isLoading: false})
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      3,
      setFollowUpIsStreaming({answerId: runId, isStreaming: true})
    );
  });

  it('records follow-up step starts with the tracked answer id', () => {
    strategy.onStepStartedEvent!({
      event: {stepName: 'searching', timestamp: 321},
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      followUpStepStarted({
        name: 'searching',
        startedAt: 321,
        answerId: runId,
      })
    );
  });

  it('records follow-up step completion and falls back to Date.now()', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(654);

    strategy.onStepFinishedEvent!({
      event: {stepName: 'answering'},
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      followUpStepFinished({
        name: 'answering',
        finishedAt: 654,
        answerId: runId,
      })
    );

    nowSpy.mockRestore();
  });

  it('appends streaming chunks with the tracked run identifier', () => {
    strategy.onTextMessageContentEvent!({event: {delta: 'Chunk'}} as any);

    expect(dispatch).toHaveBeenCalledWith(
      followUpMessageChunkReceived({answerId: runId, textDelta: 'Chunk'})
    );
  });

  it('stores the content format received in header events', () => {
    strategy.onCustomEvent!({
      event: {
        name: 'header',
        value: {contentFormat: 'text/markdown'},
      },
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      setFollowUpAnswerContentFormat({
        answerId: runId,
        contentFormat: 'text/markdown',
      })
    );
  });

  it('updates citations when follow-up citations arrive', () => {
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
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      followUpCitationsReceived({answerId: runId, citations})
    );
  });

  it('records failures with normalized error codes', () => {
    strategy.onRunErrorEvent!({
      event: {
        message: 'Failure',
        code: 'KNOWLEDGE:SSE_MODELS_NOT_AVAILABLE',
      },
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      followUpFailed({
        answerId: runId,
        message: 'Failure',
        code: GeneratedAnswerSseErrorCode.SseModelsNotAvailable,
      })
    );
  });

  it('records turn limit failures using the input run id when no run was started', () => {
    strategy = createFollowUpStrategy(dispatch, analytics as any);

    strategy.onRunErrorEvent!({
      input: {runId: 'run-456'},
      event: {
        message: 'Failure',
        code: 'KNOWLEDGE:SSE_TURN_LIMIT_REACHED',
      },
    } as any);

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      setActiveFollowUpAnswerId('run-456')
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      followUpFailed({
        answerId: 'run-456',
        message: 'Failure',
        code: GeneratedAnswerSseErrorCode.SseTurnLimitReached,
      })
    );
  });

  it('resets the tracked run identifier after failures', () => {
    strategy.onRunErrorEvent!({
      event: {
        message: 'Failure',
      },
    } as any);

    vi.clearAllMocks();

    const nextRunId = 'run-456';
    strategy.onRunStartedEvent!({event: {runId: nextRunId}} as any);
    (dispatch as ReturnType<typeof vi.fn>).mockClear();

    strategy.onTextMessageContentEvent!({event: {delta: 'Chunk'}} as any);

    expect(dispatch).toHaveBeenCalledWith(
      followUpMessageChunkReceived({answerId: nextRunId, textDelta: 'Chunk'})
    );
  });

  it('marks a completed run as answerable when the agent responds', () => {
    strategy.onRunFinishedEvent!({
      event: {
        result: {completionReason: 'ANSWERED'},
      },
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      followUpCompleted({answerId: runId, cannotAnswer: false})
    );
  });

  it('marks a completed run as unanswered when no answer is generated', () => {
    strategy.onRunFinishedEvent!({
      event: {
        result: {completionReason: 'NO_RESULTS'},
      },
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      followUpCompleted({answerId: runId, cannotAnswer: true})
    );
  });

  it('dispatches stream end and response linked analytics when a run finishes', () => {
    const streamEndAction = vi.fn() as any;
    const responseLinkedAction = vi.fn() as any;
    analytics.logGeneratedAnswerStreamEnd.mockReturnValue(streamEndAction);
    analytics.logGeneratedAnswerResponseLinked.mockReturnValue(
      responseLinkedAction
    );
    strategy = createFollowUpStrategy(dispatch, analytics as any);
    strategy.onRunStartedEvent!({event: {runId}} as any);
    vi.clearAllMocks();

    strategy.onRunFinishedEvent!({
      event: {
        result: {completionReason: 'ANSWERED'},
        threadId: 'conversation-123',
      },
    } as any);

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      followUpCompleted({answerId: runId, cannotAnswer: false})
    );
    expect(analytics.logGeneratedAnswerStreamEnd).toHaveBeenCalledWith(
      true,
      runId,
      true
    );
    expect(analytics.logGeneratedAnswerResponseLinked).toHaveBeenCalledWith(
      runId
    );
    expect(dispatch).toHaveBeenNthCalledWith(2, streamEndAction);
    expect(dispatch).toHaveBeenNthCalledWith(3, responseLinkedAction);
  });

  it('resets the tracked run identifier after completion', () => {
    strategy.onRunFinishedEvent!({
      event: {
        result: {completionReason: 'ANSWERED'},
      },
    } as any);

    vi.clearAllMocks();

    const nextRunId = 'run-789';
    strategy.onRunStartedEvent!({event: {runId: nextRunId}} as any);
    (dispatch as ReturnType<typeof vi.fn>).mockClear();

    strategy.onTextMessageContentEvent!({event: {delta: 'Chunk'}} as any);

    expect(dispatch).toHaveBeenCalledWith(
      followUpMessageChunkReceived({answerId: nextRunId, textDelta: 'Chunk'})
    );
  });

  describe('tool call handlers', () => {
    it('dispatches followUpToolCallStarted when a tool call starts', () => {
      strategy.onToolCallStartEvent!({
        event: {toolCallName: 'search', toolCallId: 'tc-1', timestamp: 100},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        followUpToolCallStarted({
          answerId: runId,
          toolCallName: 'search',
          toolCallId: 'tc-1',
          startedAt: 100,
        })
      );
    });

    it('dispatches followUpToolCallStarted with Date.now() when timestamp is missing', () => {
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(999);

      strategy.onToolCallStartEvent!({
        event: {toolCallName: 'search', toolCallId: 'tc-2'},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        followUpToolCallStarted({
          answerId: runId,
          toolCallName: 'search',
          toolCallId: 'tc-2',
          startedAt: 999,
        })
      );

      nowSpy.mockRestore();
    });

    it('dispatches followUpToolCallFinished when a tool call ends', () => {
      strategy.onToolCallEndEvent!({
        event: {toolCallId: 'tc-1', timestamp: 200},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        followUpToolCallFinished({
          answerId: runId,
          toolCallId: 'tc-1',
          finishedAt: 200,
        })
      );
    });

    it('dispatches followUpToolCallFinished with Date.now() when timestamp is missing', () => {
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(888);

      strategy.onToolCallEndEvent!({
        event: {toolCallId: 'tc-1'},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        followUpToolCallFinished({
          answerId: runId,
          toolCallId: 'tc-1',
          finishedAt: 888,
        })
      );

      nowSpy.mockRestore();
    });

    it('dispatches followUpToolCallArgs with type "search" when delta contains a q field', () => {
      strategy.onToolCallArgsEvent!({
        event: {toolCallId: 'tc-1', delta: '{"q":"test query"}'},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        followUpToolCallArgs({
          answerId: runId,
          toolCallId: 'tc-1',
          args: {q: 'test query'},
          type: 'search',
        })
      );
    });

    it('dispatches followUpToolCallArgs with type "generic" when delta has no q field', () => {
      strategy.onToolCallArgsEvent!({
        event: {toolCallId: 'tc-1', delta: '{"foo":"bar"}'},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        followUpToolCallArgs({
          answerId: runId,
          toolCallId: 'tc-1',
          args: {raw: '{"foo":"bar"}'},
          type: 'generic',
        })
      );
    });

    it('dispatches followUpToolCallArgs with type "generic" when delta is not valid JSON', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      strategy.onToolCallArgsEvent!({
        event: {toolCallId: 'tc-1', delta: 'not-json'},
      } as any);

      expect(dispatch).toHaveBeenCalledWith(
        followUpToolCallArgs({
          answerId: runId,
          toolCallId: 'tc-1',
          args: {raw: 'not-json'},
          type: 'generic',
        })
      );

      warnSpy.mockRestore();
    });
  });
});
