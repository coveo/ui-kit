import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {Message} from '../../api/knowledge/answer-generation/streaming/types.js';
import {buildMockCitation} from '../../test/mock-citation.js';
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
    describe('genqa.headerMessageType', () => {
      it('should dispatch contentFormat actions when contentFormat is present', () => {
        const message: Message = {
          payloadType: 'genqa.headerMessageType',
          payload: JSON.stringify({contentFormat: 'text/markdown'}),
        };

        createHeadAnswerStrategy().handleMessage['genqa.headerMessageType']?.(
          message,
          mockDispatch
        );

        expect(setAnswerContentFormat).toHaveBeenCalledWith('text/markdown');
        expect(setIsStreaming).toHaveBeenCalledWith(true);
        expect(setIsLoading).toHaveBeenCalledWith(false);
        expect(mockDispatch).toHaveBeenCalledTimes(3);
      });

      it('should handle empty payload gracefully', () => {
        const message: Message = {
          payloadType: 'genqa.headerMessageType',
          payload: '',
        };

        createHeadAnswerStrategy().handleMessage['genqa.headerMessageType']?.(
          message,
          mockDispatch
        );

        expect(setAnswerContentFormat).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });

      it('should not dispatch actions when contentFormat is missing from payload', () => {
        const message: Message = {
          payloadType: 'genqa.headerMessageType',
          payload: JSON.stringify({someOtherField: 'value'}),
        };

        createHeadAnswerStrategy().handleMessage['genqa.headerMessageType']?.(
          message,
          mockDispatch
        );

        expect(setAnswerContentFormat).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });

    describe('genqa.messageType', () => {
      it('should dispatch updateMessage when textDelta is present', () => {
        const message: Message = {
          payloadType: 'genqa.messageType',
          payload: JSON.stringify({textDelta: 'Hello world'}),
        };

        createHeadAnswerStrategy().handleMessage['genqa.messageType']?.(
          message,
          mockDispatch
        );

        expect(updateMessage).toHaveBeenCalledWith({textDelta: 'Hello world'});
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should handle empty payload gracefully', () => {
        const message: Message = {
          payloadType: 'genqa.messageType',
          payload: '',
        };

        createHeadAnswerStrategy().handleMessage['genqa.messageType']?.(
          message,
          mockDispatch
        );

        expect(updateMessage).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });

      it('should not dispatch updateMessage when textDelta is missing', () => {
        const message: Message = {
          payloadType: 'genqa.messageType',
          payload: JSON.stringify({someOtherField: 'value'}),
        };

        createHeadAnswerStrategy().handleMessage['genqa.messageType']?.(
          message,
          mockDispatch
        );

        expect(updateMessage).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });

    describe('genqa.citationsType', () => {
      it('should dispatch updateCitations when citations are present', () => {
        const mockCitations = [buildMockCitation(), buildMockCitation()];
        const message: Message = {
          payloadType: 'genqa.citationsType',
          payload: JSON.stringify({citations: mockCitations}),
        };

        createHeadAnswerStrategy().handleMessage['genqa.citationsType']?.(
          message,
          mockDispatch
        );

        expect(updateCitations).toHaveBeenCalledWith({
          citations: mockCitations,
        });
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('should handle empty payload gracefully', () => {
        const message: Message = {
          payloadType: 'genqa.citationsType',
          payload: '',
        };

        createHeadAnswerStrategy().handleMessage['genqa.citationsType']?.(
          message,
          mockDispatch
        );

        expect(updateCitations).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });

      it('should not dispatch updateCitations when citations are missing', () => {
        const message: Message = {
          payloadType: 'genqa.citationsType',
          payload: JSON.stringify({someOtherField: 'value'}),
        };

        createHeadAnswerStrategy().handleMessage['genqa.citationsType']?.(
          message,
          mockDispatch
        );

        expect(updateCitations).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });

    describe('genqa.endOfStreamType', () => {
      it('should dispatch all end-of-stream actions when answerGenerated is true', () => {
        const message: Message = {
          payloadType: 'genqa.endOfStreamType',
          payload: JSON.stringify({answerGenerated: true}),
        };

        createHeadAnswerStrategy().handleMessage['genqa.endOfStreamType']?.(
          message,
          mockDispatch
        );

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
          payloadType: 'genqa.endOfStreamType',
          payload: JSON.stringify({answerGenerated: false}),
        };

        createHeadAnswerStrategy().handleMessage['genqa.endOfStreamType']?.(
          message,
          mockDispatch
        );

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
          payloadType: 'genqa.endOfStreamType',
          payload: JSON.stringify({}),
        };

        createHeadAnswerStrategy().handleMessage['genqa.endOfStreamType']?.(
          message,
          mockDispatch
        );

        expect(setIsAnswerGenerated).toHaveBeenCalledWith(false);
        expect(setCannotAnswer).toHaveBeenCalledWith(true);
        expect(setIsStreaming).toHaveBeenCalledWith(false);
        expect(setIsLoading).toHaveBeenCalledWith(false);
        expect(logGeneratedAnswerStreamEnd).toHaveBeenCalledWith(false);
        expect(logGeneratedAnswerResponseLinked).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledTimes(6);
      });

      it('should handle empty payload gracefully', () => {
        const message: Message = {
          payloadType: 'genqa.endOfStreamType',
          payload: '',
        };

        createHeadAnswerStrategy().handleMessage['genqa.endOfStreamType']?.(
          message,
          mockDispatch
        );

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
      it('should dispatch updateError when finishReason is ERROR and errorMessage exists', () => {
        const message: Message = {
          payloadType: 'genqa.messageType',
          payload: '',
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
          payloadType: 'genqa.messageType',
          payload: '',
          finishReason: 'COMPLETED',
          errorMessage: 'Something went wrong',
        };

        createHeadAnswerStrategy().handleMessage.error?.(message, mockDispatch);

        expect(updateError).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });

      it('should not dispatch updateError when errorMessage is missing', () => {
        const message: Message = {
          payloadType: 'genqa.messageType',
          payload: '',
          finishReason: 'ERROR',
        };

        createHeadAnswerStrategy().handleMessage.error?.(message, mockDispatch);

        expect(updateError).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });

      it('should not dispatch updateError when both finishReason and errorMessage are missing', () => {
        const message: Message = {
          payloadType: 'genqa.messageType',
          payload: '',
        };

        createHeadAnswerStrategy().handleMessage.error?.(message, mockDispatch);

        expect(updateError).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });
  });
});
