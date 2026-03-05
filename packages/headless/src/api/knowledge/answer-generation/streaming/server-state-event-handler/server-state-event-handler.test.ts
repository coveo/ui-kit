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
    describe('agentInteraction.answerHeader', () => {
      it('should call initializeStreamingAnswer with markdown content format', () => {
        const message: Message = {
          payloadType: 'agentInteraction.answerHeader',
          payload: {},
        };

        serverStateEventHandler.handleMessage['agentInteraction.answerHeader']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).toHaveBeenCalledTimes(1);
        expect(
          answerDraftReducer.initializeStreamingAnswer
        ).toHaveBeenCalledWith(mockDraft, {contentFormat: 'text/markdown'});
      });
    });

    describe('generativeengines.messageType', () => {
      it('should call setAnswer when textDelta is present in the payload', () => {
        const payload: StreamPayload = {
          textDelta: 'Test answer chunk',
        };
        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload,
        };

        serverStateEventHandler.handleMessage['generativeengines.messageType']!(
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
        const payload: Partial<StreamPayload> = {};
        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload,
        };

        serverStateEventHandler.handleMessage['generativeengines.messageType']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).not.toHaveBeenCalled();
        expect(answerDraftReducer.setAnswer).not.toHaveBeenCalled();
      });
    });

    describe('agentInteraction.citations', () => {
      it('should call setCitations when citations are present', () => {
        const payload: StreamPayload = {
          citations: [
            {
              id: 'citation-1',
              title: 'Test Citation',
              uri: 'https://example.com',
              permanentid: 'perm-id-123',
              source: 'Example Source',
            },
          ],
        };
        const message: Message = {
          payloadType: 'agentInteraction.citations',
          payload,
        };

        serverStateEventHandler.handleMessage['agentInteraction.citations']!(
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
        const payload: Partial<StreamPayload> = {};
        const message: Message = {
          payloadType: 'agentInteraction.citations',
          payload,
        };

        serverStateEventHandler.handleMessage['agentInteraction.citations']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).not.toHaveBeenCalled();
        expect(answerDraftReducer.setCitations).not.toHaveBeenCalled();
      });

      it('should call setCitations when citations is an empty array', () => {
        const payload: StreamPayload = {
          citations: [],
        };
        const message: Message = {
          payloadType: 'agentInteraction.citations',
          payload,
        };

        serverStateEventHandler.handleMessage['agentInteraction.citations']!(
          message,
          mockUpdateCachedData
        );

        expect(mockUpdateCachedData).toHaveBeenCalledTimes(1);
        expect(answerDraftReducer.setCitations).toHaveBeenCalledWith(
          mockDraft,
          payload
        );
      });
    });

    describe('generativeengines.endOfStreamType', () => {
      it('should call endStreaming with the payload', () => {
        const payload: StreamPayload = {
          answerGenerated: true,
        };
        const message: Message = {
          payloadType: 'generativeengines.endOfStreamType',
          payload,
        };

        serverStateEventHandler.handleMessage[
          'generativeengines.endOfStreamType'
        ]!(message, mockUpdateCachedData);

        expect(mockUpdateCachedData).toHaveBeenCalledTimes(1);
        expect(answerDraftReducer.endStreaming).toHaveBeenCalledWith(
          mockDraft,
          payload
        );
      });
    });

    describe('error', () => {
      it('should call setAnswerError when finishReason is ERROR', () => {
        const message: Message = {
          payloadType: 'generativeengines.messageType',
          payload: {},
          finishReason: 'ERROR',
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
          payloadType: 'generativeengines.messageType',
          payload: {},
          finishReason: 'SUCCESS',
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
