/** biome-ignore-all lint/suspicious/noExplicitAny: unit test */

import type {AgentSubscriber} from '@ag-ui/client';
import type {Dispatch} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  setFollowUpAnswersConversationId,
  setIsEnabled,
} from '../../../../../features/follow-up-answers/follow-up-answers-actions.js';
import {
  finishStep,
  setAnswerContentFormat,
  setAnswerId,
  setCannotAnswer,
  setIsAnswerGenerated,
  setIsLoading,
  setIsStreaming,
  startStep,
  updateCitations,
  updateError,
  updateMessage,
} from '../../../../../features/generated-answer/generated-answer-actions.js';
import {createHeadAnswerStrategy} from './head-answer-strategy.js';

describe('createHeadAnswerStrategy', () => {
  let dispatch: ReturnType<typeof vi.fn> & Dispatch;
  let strategy: AgentSubscriber;

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
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      startStep({name: 'searching', startedAt: 123})
    );
  });

  it('records the completion of a generation step and falls back to Date.now()', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(456);

    strategy.onStepFinishedEvent!({
      event: {stepName: 'answering'},
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      finishStep({name: 'answering', finishedAt: 456})
    );

    nowSpy.mockRestore();
  });

  it('appends incoming text deltas to the answer message', () => {
    strategy.onTextMessageContentEvent!({event: {delta: 'Hello'}} as any);

    expect(dispatch).toHaveBeenCalledWith(updateMessage({textDelta: 'Hello'}));
  });

  it('handles header metadata by dispatching the relevant updates', () => {
    strategy.onCustomEvent!({
      event: {
        name: 'header',
        value: {
          contentFormat: 'text/markdown',
          followUpEnabled: true,
        },
      },
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      setAnswerContentFormat('text/markdown')
    );
    expect(dispatch).toHaveBeenCalledWith(setIsEnabled(true));
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
    } as any);

    expect(dispatch).toHaveBeenCalledWith(updateCitations({citations}));
  });

  it('records errors and normalizes error codes', () => {
    strategy.onRunErrorEvent!({
      event: {
        message: 'Something went wrong',
        code: '400',
      },
    } as any);

    expect(dispatch).toHaveBeenCalledWith(
      updateError({message: 'Something went wrong', code: 400})
    );
  });

  it('finalizes the run with the answer generation result', () => {
    strategy.onRunFinishedEvent!({
      event: {
        result: {
          answerGenerated: true,
        },
      },
    } as any);

    expect(dispatch).toHaveBeenNthCalledWith(1, setIsAnswerGenerated(true));
    expect(dispatch).toHaveBeenNthCalledWith(2, setCannotAnswer(false));
    expect(dispatch).toHaveBeenNthCalledWith(3, setIsStreaming(false));
  });

  it('disables answer flags when no answer was generated', () => {
    strategy.onRunFinishedEvent!({event: {}} as any);

    expect(dispatch).toHaveBeenNthCalledWith(1, setIsAnswerGenerated(false));
    expect(dispatch).toHaveBeenNthCalledWith(2, setCannotAnswer(true));
    expect(dispatch).toHaveBeenNthCalledWith(3, setIsStreaming(false));
  });
});
