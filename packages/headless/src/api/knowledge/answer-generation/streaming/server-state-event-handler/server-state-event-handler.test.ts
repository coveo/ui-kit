import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {GeneratedAnswerServerState} from '../../answer-generation-api-state.js';
import * as answerDraftReducer from '../answer-draft-reducer/answer-draft-reducer.js';
import type {Message, StreamPayload} from '../types.js';
import {serverStateEventHandler} from './server-state-event-handler.js';

vi.mock('../answer-draft-reducer/answer-draft-reducer.js');

describe('serverStateEventHandler', () => {
  let mockUpdateCachedData: (
    updater: (draft: GeneratedAnswerServerState) => void
  ) => void;
  let mockDraft: GeneratedAnswerServerState;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDraft = {
      isStreaming: false,
      isLoading: true,
    } as GeneratedAnswerServerState;

    mockUpdateCachedData = vi.fn((updater) => {
      updater(mockDraft);
    });
  });

  describe('#handleOpen', () => {
    it('should call setAnswerId when x-answer-id header is present', () => {
      const answerId = 'test-answer-id-123';
      const mockResponse = {
        headers: {
          get: vi.fn((key: string) =>
            key === 'x-answer-id' ? answerId : null
          ),
        },
      } as unknown as Response;

      serverStateEventHandler.handleOpen(mockResponse, mockUpdateCachedData);

      expect(mockUpdateCachedData).toHaveBeenCalledTimes(1);
      expect(answerDraftReducer.setAnswerId).toHaveBeenCalledWith(
        mockDraft,
        answerId
      );
    });

    it('should not call setAnswerId when x-answer-id header is missing', () => {
      const mockResponse = {
        headers: {
          get: vi.fn(() => null),
        },
      } as unknown as Response;

      serverStateEventHandler.handleOpen(mockResponse, mockUpdateCachedData);

      expect(mockUpdateCachedData).not.toHaveBeenCalled();
      expect(answerDraftReducer.setAnswerId).not.toHaveBeenCalled();
    });
  });

  describe('#handleMessage', () => {
    describe('genqa.headerMessageType', () => {
      it('should call initializeStreamingAnswer when contentFormat is present', () => {
        const payload: StreamPayload = {
          contentFormat: 'text/markdown',
          citations: [],
        };
        const message: Message = {
          payloadType: 'genqa.headerMessageType',
          payload: JSON.stringify(payload),
        };

        serverStateEventHandler.handleMessage['genqa.headerMessageType']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).toHaveBeenCalledTimes(1);
        expect(
          answerDraftReducer.initializeStreamingAnswer
        ).toHaveBeenCalledWith(mockDraft, payload);
      });

      it('should not call initializeStreamingAnswer when contentFormat is missing', () => {
        const payload: Partial<StreamPayload> = {
          citations: [],
        };
        const message: Message = {
          payloadType: 'genqa.headerMessageType',
          payload: JSON.stringify(payload),
        };

        serverStateEventHandler.handleMessage['genqa.headerMessageType']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).not.toHaveBeenCalled();
        expect(
          answerDraftReducer.initializeStreamingAnswer
        ).not.toHaveBeenCalled();
      });
    });

    describe('genqa.messageType', () => {
      it('should call setAnswer when textDelta is present', () => {
        const payload: StreamPayload = {
          textDelta: 'Test answer chunk',
          contentFormat: 'text/markdown',
          citations: [],
        };
        const message: Message = {
          payloadType: 'genqa.messageType',
          payload: JSON.stringify(payload),
        };

        serverStateEventHandler.handleMessage['genqa.messageType']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).toHaveBeenCalledTimes(1);
        expect(answerDraftReducer.setAnswer).toHaveBeenCalledWith(
          mockDraft,
          payload
        );
      });

      it('should not call setAnswer when textDelta is missing', () => {
        const payload: Partial<StreamPayload> = {
          contentFormat: 'text/markdown',
          citations: [],
        };
        const message: Message = {
          payloadType: 'genqa.messageType',
          payload: JSON.stringify(payload),
        };

        serverStateEventHandler.handleMessage['genqa.messageType']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).not.toHaveBeenCalled();
        expect(answerDraftReducer.setAnswer).not.toHaveBeenCalled();
      });
    });

    describe('genqa.citationsType', () => {
      it('should call setCitations when citations are present', () => {
        const citations = [
          {
            id: 'citation-1',
            title: 'Test Citation',
            uri: 'https://example.com',
            source: 'Example Source',
            permanentid: 'perm-1',
            clickUri: 'https://example.com/click',
          },
        ];
        const payload: StreamPayload = {
          citations,
          contentFormat: 'text/markdown',
        };
        const message: Message = {
          payloadType: 'genqa.citationsType',
          payload: JSON.stringify(payload),
        };

        serverStateEventHandler.handleMessage['genqa.citationsType']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).toHaveBeenCalledTimes(1);
        expect(answerDraftReducer.setCitations).toHaveBeenCalledWith(
          mockDraft,
          payload
        );
      });

      it('should not call setCitations when citations are missing', () => {
        const payload: Partial<StreamPayload> = {
          contentFormat: 'text/markdown',
        };
        const message: Message = {
          payloadType: 'genqa.citationsType',
          payload: JSON.stringify(payload),
        };

        serverStateEventHandler.handleMessage['genqa.citationsType']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).not.toHaveBeenCalled();
        expect(answerDraftReducer.setCitations).not.toHaveBeenCalled();
      });

      it('should not call setCitations when citations is an empty array', () => {
        const payload: Partial<StreamPayload> = {
          citations: [],
          contentFormat: 'text/markdown',
        };
        const message: Message = {
          payloadType: 'genqa.citationsType',
          payload: JSON.stringify(payload),
        };

        serverStateEventHandler.handleMessage['genqa.citationsType']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).toHaveBeenCalled();
        expect(answerDraftReducer.setCitations).toHaveBeenCalledWith(
          mockDraft,
          payload
        );
      });
    });

    describe('genqa.endOfStreamType', () => {
      it('should call endStreaming with parsed payload', () => {
        const payload: StreamPayload = {
          answerGenerated: true,
          contentFormat: 'text/markdown',
          citations: [],
        };
        const message: Message = {
          payloadType: 'genqa.endOfStreamType',
          payload: JSON.stringify(payload),
        };

        serverStateEventHandler.handleMessage['genqa.endOfStreamType']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).toHaveBeenCalledTimes(1);
        expect(answerDraftReducer.endStreaming).toHaveBeenCalledWith(
          mockDraft,
          payload
        );
      });
    });

    describe('error', () => {
      it('should call setAnswerError when finishReason is ERROR and errorMessage is present', () => {
        const message: Message = {
          payloadType: 'genqa.messageType',
          payload: '',
          finishReason: 'ERROR',
          errorMessage: 'Test error message',
          code: 500,
        };

        serverStateEventHandler.handleMessage.error!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).toHaveBeenCalledTimes(1);
        expect(answerDraftReducer.setAnswerError).toHaveBeenCalledWith(
          mockDraft,
          message
        );
      });

      it('should not call setAnswerError when finishReason is not ERROR', () => {
        const message: Message = {
          payloadType: 'genqa.messageType',
          payload: '',
          finishReason: 'SUCCESS',
          errorMessage: 'Some message',
        };

        serverStateEventHandler.handleMessage.error!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).not.toHaveBeenCalled();
        expect(answerDraftReducer.setAnswerError).not.toHaveBeenCalled();
      });
    });
  });
});
