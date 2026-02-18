import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {
  Message,
  StreamPayload,
} from '../../api/knowledge/answer-generation/streaming/types.js';
import {buildMockCitation} from '../../test/mock-citation.js';
import {createFollowUpAnswerStrategy} from './follow-up-answer-strategy.js';
import {
  followUpCitationsReceived,
  followUpCompleted,
  followUpFailed,
  followUpMessageChunkReceived,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpIsLoading,
} from './follow-up-answers-actions.js';

vi.mock('./follow-up-answers-actions.js');

describe('followUpAnswerStrategy', () => {
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
    it('should dispatch follow-up initialization actions when x-answer-id header is present', () => {
      const mockResponse = new Response(null, {
        headers: {'x-answer-id': 'test-answer-id-123'},
      });

      createFollowUpAnswerStrategy().handleOpen(mockResponse, mockDispatch);

      expect(setActiveFollowUpAnswerId).toHaveBeenCalledWith(
        'test-answer-id-123'
      );
      expect(setFollowUpIsLoading).toHaveBeenCalledWith({
        answerId: 'test-answer-id-123',
        isLoading: true,
      });
      expect(setFollowUpAnswerContentFormat).toHaveBeenCalledWith({
        contentFormat: 'text/markdown',
        answerId: 'test-answer-id-123',
      });
      expect(mockDispatch).toHaveBeenCalledTimes(3);
    });

    it('should not dispatch actions when x-answer-id header is missing', () => {
      const mockResponse = new Response(null, {
        headers: {},
      });

      createFollowUpAnswerStrategy().handleOpen(mockResponse, mockDispatch);

      expect(setActiveFollowUpAnswerId).not.toHaveBeenCalled();
      expect(setFollowUpIsLoading).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('handleError', () => {
    it('should throw the error', () => {
      const error = new Error('Test error');

      expect(() => createFollowUpAnswerStrategy().handleError(error)).toThrow(
        'Test error'
      );
    });

    it('should throw generic errors', () => {
      const error = {message: 'Custom error object'};

      expect(() => createFollowUpAnswerStrategy().handleError(error)).toThrow();
    });
  });

  describe('handleMessage', () => {
    describe('generativeengines.messageType', () => {
      it('should dispatch followUpMessageChunkReceived when textDelta is present', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const payload: StreamPayload = {textDelta: 'Hello world'};
        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload,
        };

        strategy.handleMessage['generativeengines.messageType']?.(
          message,
          mockDispatch
        );

        expect(followUpMessageChunkReceived).toHaveBeenCalledWith({
          textDelta: 'Hello world',
          answerId: 'answer-123',
        });
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should not dispatch followUpMessageChunkReceived when textDelta is missing', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload: {},
        };

        strategy.handleMessage['generativeengines.messageType']?.(
          message,
          mockDispatch
        );

        expect(followUpMessageChunkReceived).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });

    describe('agentInteraction.citations', () => {
      it('should dispatch followUpCitationsReceived when citations are present', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const mockCitations = [buildMockCitation(), buildMockCitation()];
        const message: Message = {
          payloadType: 'agentInteraction.citations',
          payload: {citations: mockCitations},
        };

        strategy.handleMessage['agentInteraction.citations']?.(
          message,
          mockDispatch
        );

        expect(followUpCitationsReceived).toHaveBeenCalledWith({
          citations: mockCitations,
          answerId: 'answer-123',
        });
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should dispatch followUpCitationsReceived when citations is an empty array', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const message: Message = {
          payloadType: 'agentInteraction.citations',
          payload: {citations: []},
        };

        strategy.handleMessage['agentInteraction.citations']?.(
          message,
          mockDispatch
        );

        expect(followUpCitationsReceived).toHaveBeenCalledWith({
          citations: [],
          answerId: 'answer-123',
        });
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should not dispatch followUpCitationsReceived when citations are missing', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const message: Message = {
          payloadType: 'agentInteraction.citations',
          payload: {},
        };

        strategy.handleMessage['agentInteraction.citations']?.(
          message,
          mockDispatch
        );

        expect(followUpCitationsReceived).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });

    describe('generativeengines.endOfStreamType', () => {
      it('should dispatch followUpCompleted action when answerGenerated is true', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const message: Message = {
          payloadType: 'generativeengines.endOfStreamType',
          payload: {answerGenerated: true},
        };

        strategy.handleMessage['generativeengines.endOfStreamType']?.(
          message,
          mockDispatch
        );

        expect(followUpCompleted).toHaveBeenCalledWith({
          cannotAnswer: false,
          answerId: 'answer-123',
        });
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should dispatch followUpCompleted action when answerGenerated is false', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const message: Message = {
          payloadType: 'generativeengines.endOfStreamType',
          payload: {answerGenerated: false},
        };

        strategy.handleMessage['generativeengines.endOfStreamType']?.(
          message,
          mockDispatch
        );

        expect(followUpCompleted).toHaveBeenCalledWith({
          cannotAnswer: true,
          answerId: 'answer-123',
        });
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should handle missing answerGenerated field gracefully', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const message: Message = {
          payloadType: 'generativeengines.endOfStreamType',
          payload: {},
        };

        strategy.handleMessage['generativeengines.endOfStreamType']?.(
          message,
          mockDispatch
        );

        expect(followUpCompleted).toHaveBeenCalledWith({
          cannotAnswer: true,
          answerId: 'answer-123',
        });
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });
    });

    describe('error', () => {
      it('should dispatch followUpFailed when finishReason is ERROR', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload: {},
          finishReason: 'ERROR',
          errorMessage: 'Something went wrong',
          code: 500,
        };

        strategy.handleMessage.error?.(message, mockDispatch);

        expect(followUpFailed).toHaveBeenCalledWith({
          answerId: 'answer-123',
          message: 'Something went wrong',
          code: 500,
        });
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should dispatch followUpFailed with undefined message when errorMessage is missing', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload: {},
          finishReason: 'ERROR',
          code: 500,
        };

        strategy.handleMessage.error?.(message, mockDispatch);

        expect(followUpFailed).toHaveBeenCalledWith({
          answerId: 'answer-123',
          message: undefined,
          code: 500,
        });
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should not dispatch followUpFailed when finishReason is not ERROR', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload: {},
          finishReason: 'COMPLETED',
          errorMessage: 'Something went wrong',
        };

        strategy.handleMessage.error?.(message, mockDispatch);

        expect(followUpFailed).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });

      it('should not dispatch followUpFailed when finishReason is missing', () => {
        const strategy = createFollowUpAnswerStrategy();
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'answer-123'},
        });
        strategy.handleOpen(mockResponse, mockDispatch);
        vi.clearAllMocks();

        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload: {},
          errorMessage: 'Something went wrong',
        };

        strategy.handleMessage.error?.(message, mockDispatch);

        expect(followUpFailed).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });
  });
});
