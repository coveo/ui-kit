/** biome-ignore-all lint/suspicious/noExplicitAny: unit test */

import type {AgentSubscriber} from '@ag-ui/client';
import type {Dispatch} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  followUpCitationsReceived,
  followUpCompleted,
  followUpFailed,
  followUpMessageChunkReceived,
  followUpStepFinished,
  followUpStepStarted,
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

  const runId = 'run-123';

  beforeEach(() => {
    dispatch = vi.fn() as unknown as ReturnType<typeof vi.fn> & Dispatch;
    strategy = createFollowUpStrategy(dispatch);
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
});
