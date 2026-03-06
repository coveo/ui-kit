import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {
  Message,
  StreamPayload,
} from '../../api/knowledge/answer-generation/streaming/types.js';
import {buildMockCitation} from '../../test/mock-citation.js';
import {
  setFollowUpAnswersConversationId,
  setIsEnabled,
} from '../follow-up-answers/follow-up-answers-actions.js';
import {
  setAnswerContentFormat,
  setAnswerId,
  setCannotAnswer,
  setIsAnswerGenerated,
  setIsLoading,
  setIsStreaming,
  updateCitations,
  updateError,
  updateMessage,
} from './generated-answer-actions.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from './generated-answer-analytics-actions.js';
import {createHeadAnswerStrategy} from './head-answer-strategy.js';

vi.mock('./generated-answer-actions.js');
vi.mock('./generated-answer-analytics-actions.js');
vi.mock('../follow-up-answers/follow-up-answers-actions.js');

describe('headAnswerStrategy', () => {
  let mockDispatch: ThunkDispatch<
    AnswerGenerationApiState,
    unknown,
    UnknownAction
  >;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch = vi.fn();
  });

  describe('handleOpen', () => {
    it('should dispatch setAnswerId when x-answer-id header is present', () => {
      const mockResponse = new Response(null, {
        headers: {'x-answer-id': 'test-answer-id-123'},
      });

      createHeadAnswerStrategy().handleOpen(mockResponse, mockDispatch);

      expect(setAnswerId).toHaveBeenCalledWith('test-answer-id-123');
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it('should not dispatch setAnswerId when x-answer-id header is missing', () => {
      const mockResponse = new Response(null, {
        headers: {},
      });

      createHeadAnswerStrategy().handleOpen(mockResponse, mockDispatch);

      expect(setAnswerId).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('handleError', () => {
    it('should throw the error', () => {
      const error = new Error('Test error');

      expect(() => createHeadAnswerStrategy().handleError(error)).toThrow(
        'Test error'
      );
    });

    it('should throw generic errors', () => {
      const error = {message: 'Custom error object'};

      expect(() => createHeadAnswerStrategy().handleError(error)).toThrow();
    });
  });

  describe('handleMessage', () => {
    describe('agentInteraction.answerHeader', () => {
      it('should dispatch conversation and follow-up flags then streaming state', () => {
        const payload: StreamPayload = {
          conversationId: 'conv-123',
          followUpEnabled: true,
        };
        const message: Message = {
          payloadType: 'agentInteraction.answerHeader',
          payload,
        };

        createHeadAnswerStrategy().handleMessage[
          'agentInteraction.answerHeader'
        ]?.(message, mockDispatch);

        expect(setFollowUpAnswersConversationId).toHaveBeenCalledWith(
          'conv-123'
        );
        expect(setIsEnabled).toHaveBeenCalledWith(true);
        expect(setAnswerContentFormat).toHaveBeenCalledWith('text/markdown');
        expect(setIsStreaming).toHaveBeenCalledWith(true);
        expect(setIsLoading).toHaveBeenCalledWith(false);
        expect(mockDispatch).toHaveBeenCalledTimes(5);
      });

      it('should still set streaming state when optional fields are missing', () => {
        const message: Message = {
          payloadType: 'agentInteraction.answerHeader',
          payload: {},
        };

        createHeadAnswerStrategy().handleMessage[
          'agentInteraction.answerHeader'
        ]?.(message, mockDispatch);

        expect(setFollowUpAnswersConversationId).not.toHaveBeenCalled();
        expect(setIsEnabled).not.toHaveBeenCalled();
        expect(setAnswerContentFormat).toHaveBeenCalledWith('text/markdown');
        expect(setIsStreaming).toHaveBeenCalledWith(true);
        expect(setIsLoading).toHaveBeenCalledWith(false);
        expect(mockDispatch).toHaveBeenCalledTimes(3);
      });
    });

    describe('generativeengines.messageType', () => {
      it('should dispatch updateMessage when textDelta is present', () => {
        const payload: StreamPayload = {textDelta: 'Hello world'};
        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload,
        };

        createHeadAnswerStrategy().handleMessage[
          'generativeengines.messageType'
        ]?.(message, mockDispatch);

        expect(updateMessage).toHaveBeenCalledWith({textDelta: 'Hello world'});
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should not dispatch updateMessage when textDelta is missing', () => {
        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload: {},
        };

        createHeadAnswerStrategy().handleMessage[
          'generativeengines.messageType'
        ]?.(message, mockDispatch);

        expect(updateMessage).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });

    describe('agentInteraction.citations', () => {
      it('should dispatch updateCitations when citations are present', () => {
        const mockCitations = [buildMockCitation(), buildMockCitation()];
        const message: Message = {
          payloadType: 'agentInteraction.citations',
          payload: {citations: mockCitations},
        };

        createHeadAnswerStrategy().handleMessage[
          'agentInteraction.citations'
        ]?.(message, mockDispatch);

        expect(updateCitations).toHaveBeenCalledWith({
          citations: mockCitations,
        });
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should not dispatch updateCitations when citations are missing', () => {
        const message: Message = {
          payloadType: 'agentInteraction.citations',
          payload: {},
        };

        createHeadAnswerStrategy().handleMessage[
          'agentInteraction.citations'
        ]?.(message, mockDispatch);

        expect(updateCitations).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });

      it('should dispatch updateCitations when citations array is empty', () => {
        const message: Message = {
          payloadType: 'agentInteraction.citations',
          payload: {citations: []},
        };

        createHeadAnswerStrategy().handleMessage[
          'agentInteraction.citations'
        ]?.(message, mockDispatch);

        expect(updateCitations).toHaveBeenCalledWith({citations: []});
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });
    });

    describe('generativeengines.endOfStreamType', () => {
      it('should dispatch all end-of-stream actions when answerGenerated is true', () => {
        const message: Message = {
          payloadType: 'generativeengines.endOfStreamType',
          payload: {answerGenerated: true},
        };

        createHeadAnswerStrategy().handleMessage[
          'generativeengines.endOfStreamType'
        ]?.(message, mockDispatch);

        expect(setIsAnswerGenerated).toHaveBeenCalledWith(true);
        expect(setCannotAnswer).toHaveBeenCalledWith(false);
        expect(setIsStreaming).toHaveBeenCalledWith(false);
        expect(setIsLoading).toHaveBeenCalledWith(false);
        expect(logGeneratedAnswerStreamEnd).toHaveBeenCalledWith(true);
        expect(logGeneratedAnswerResponseLinked).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledTimes(6);
      });

      it('should dispatch all end-of-stream actions when answerGenerated is false', () => {
        const message: Message = {
          payloadType: 'generativeengines.endOfStreamType',
          payload: {answerGenerated: false},
        };

        createHeadAnswerStrategy().handleMessage[
          'generativeengines.endOfStreamType'
        ]?.(message, mockDispatch);

        expect(setIsAnswerGenerated).toHaveBeenCalledWith(false);
        expect(setCannotAnswer).toHaveBeenCalledWith(true);
        expect(setIsStreaming).toHaveBeenCalledWith(false);
        expect(setIsLoading).toHaveBeenCalledWith(false);
        expect(logGeneratedAnswerStreamEnd).toHaveBeenCalledWith(false);
        expect(logGeneratedAnswerResponseLinked).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledTimes(6);
      });

      it('should handle missing answerGenerated field gracefully', () => {
        const message: Message = {
          payloadType: 'generativeengines.endOfStreamType',
          payload: {},
        };

        createHeadAnswerStrategy().handleMessage[
          'generativeengines.endOfStreamType'
        ]?.(message, mockDispatch);

        expect(setIsAnswerGenerated).toHaveBeenCalledWith(false);
        expect(setCannotAnswer).toHaveBeenCalledWith(true);
        expect(setIsStreaming).toHaveBeenCalledWith(false);
        expect(setIsLoading).toHaveBeenCalledWith(false);
        expect(logGeneratedAnswerStreamEnd).toHaveBeenCalledWith(false);
        expect(logGeneratedAnswerResponseLinked).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledTimes(6);
      });
    });

    describe('error', () => {
      it('should dispatch updateError when finishReason is ERROR', () => {
        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload: {},
          finishReason: 'ERROR',
          errorMessage: 'Something went wrong',
          code: 500,
        };

        createHeadAnswerStrategy().handleMessage.error?.(message, mockDispatch);

        expect(updateError).toHaveBeenCalledWith(message);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should not dispatch updateError when finishReason is not ERROR', () => {
        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload: {},
          finishReason: 'COMPLETED',
          errorMessage: 'Something went wrong',
        };

        createHeadAnswerStrategy().handleMessage.error?.(message, mockDispatch);

        expect(updateError).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });

      it('should not dispatch updateError when finishReason is missing', () => {
        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload: {},
        };

        createHeadAnswerStrategy().handleMessage.error?.(message, mockDispatch);

        expect(updateError).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });
  });
});
