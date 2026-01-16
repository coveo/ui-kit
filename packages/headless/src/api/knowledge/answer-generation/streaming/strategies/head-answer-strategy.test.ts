/** biome-ignore-all lint/suspicious/noExplicitAny: unit test */
import {beforeEach, describe, expect, it, vi} from 'vitest';
import * as generatedAnswerActions from '../../../../../features/generated-answer/generated-answer-actions.js';
import * as generatedAnswerAnalyticsActions from '../../../../../features/generated-answer/generated-answer-analytics-actions.js';
import type {
  AnswerGenerationApiState,
  GeneratedAnswerServerState,
} from '../../answer-generation-api-state.js';
import * as endpointUrlBuilder from '../../url-builders/endpoint-url-builder.js';
import * as eventHandlers from '../event-handlers/event-handlers.js';
import {headAnswerStrategy} from './head-answer-strategy.js';
import type {Message} from './types.js';

vi.mock('../../../../../features/generated-answer/generated-answer-actions.js');
vi.mock(
  '../../../../../features/generated-answer/generated-answer-analytics-actions.js'
);
vi.mock('../../url-builders/endpoint-url-builder.js');
vi.mock('../event-handlers.js');

describe('head-answer-strategy', () => {
  let mockState: AnswerGenerationApiState;
  let mockDraft: GeneratedAnswerServerState;
  let mockUpdateCachedData: ReturnType<typeof vi.fn>;
  let mockDispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockState = {
      configuration: {
        organizationId: 'test-org',
        environment: 'prod',
      },
      generatedAnswer: {
        answerConfigurationId: 'test-config',
      },
    } as AnswerGenerationApiState;

    mockDraft = {
      isStreaming: false,
      isLoading: true,
    } as GeneratedAnswerServerState;

    mockUpdateCachedData = vi.fn((callback) => callback(mockDraft));
    mockDispatch = vi.fn();
  });

  describe('#buildEndpointUrl', () => {
    it('should call buildHeadAnswerEndpointUrl with the state', () => {
      const mockUrl =
        'https://test-org.org.coveo.com/answer/v1/configs/test-config/generate';
      vi.spyOn(
        endpointUrlBuilder,
        'buildHeadAnswerEndpointUrl'
      ).mockReturnValue(mockUrl);

      const result = headAnswerStrategy.buildEndpointUrl(mockState);

      expect(
        endpointUrlBuilder.buildHeadAnswerEndpointUrl
      ).toHaveBeenCalledWith(mockState);
      expect(result).toBe(mockUrl);
    });
  });

  describe('events', () => {
    describe('#handleOpen', () => {
      it('should handle answer ID from response headers', () => {
        const mockResponse = new Response(null, {
          headers: {'x-answer-id': 'test-answer-id-123'},
        });
        vi.spyOn(generatedAnswerActions, 'setAnswerId').mockReturnValue({
          type: 'setAnswerId',
        } as any);

        headAnswerStrategy.events.handleOpen(
          mockResponse,
          mockUpdateCachedData,
          mockDispatch
        );

        expect(mockUpdateCachedData).toHaveBeenCalled();
        expect(eventHandlers.handleAnswerId).toHaveBeenCalledWith(
          mockDraft,
          'test-answer-id-123'
        );
        expect(generatedAnswerActions.setAnswerId).toHaveBeenCalledWith(
          'test-answer-id-123'
        );
        expect(mockDispatch).toHaveBeenCalledWith({type: 'setAnswerId'});
      });

      it('should not dispatch actions when answer ID is missing', () => {
        const mockResponse = new Response(null, {headers: {}});

        headAnswerStrategy.events.handleOpen(
          mockResponse,
          mockUpdateCachedData,
          mockDispatch
        );

        expect(mockUpdateCachedData).not.toHaveBeenCalled();
        expect(eventHandlers.handleAnswerId).not.toHaveBeenCalled();
        expect(generatedAnswerActions.setAnswerId).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });

    describe('#handleClose', () => {
      it('should dispatch setCannotAnswer based on whether the answer was generated', () => {
        mockDraft.generated = true;
        const expectedCannotAnswer = !mockDraft.generated;

        vi.spyOn(generatedAnswerActions, 'setCannotAnswer').mockReturnValue({
          type: 'setCannotAnswer',
        } as any);

        headAnswerStrategy.events.handleClose(
          mockUpdateCachedData,
          mockDispatch
        );

        expect(mockUpdateCachedData).toHaveBeenCalled();
        expect(generatedAnswerActions.setCannotAnswer).toHaveBeenCalledWith(
          expectedCannotAnswer
        );
        expect(mockDispatch).toHaveBeenCalledWith({type: 'setCannotAnswer'});
      });
    });

    describe('#handleError', () => {
      it('should throw the error', () => {
        const testError = new Error('Test error');

        expect(() => headAnswerStrategy.events.handleError(testError)).toThrow(
          'Test error'
        );
      });
    });

    describe('#handleMessage', () => {
      describe('genqa.headerMessageType', () => {
        it('should handle header message with valid payload', () => {
          const message: Message = {
            payloadType: 'genqa.headerMessageType',
            payload: JSON.stringify({contentFormat: 'text/markdown'}),
          };
          vi.spyOn(
            generatedAnswerActions,
            'setAnswerContentFormat'
          ).mockReturnValue({type: 'setAnswerContentFormat'} as any);
          vi.spyOn(generatedAnswerActions, 'setIsStreaming').mockReturnValue({
            type: 'setIsStreaming',
          } as any);
          vi.spyOn(generatedAnswerActions, 'setIsLoading').mockReturnValue({
            type: 'setIsLoading',
          } as any);

          headAnswerStrategy.events.handleMessage['genqa.headerMessageType']!(
            message,
            mockUpdateCachedData,
            mockDispatch
          );

          expect(mockUpdateCachedData).toHaveBeenCalled();
          expect(eventHandlers.handleHeaderMessage).toHaveBeenCalledWith(
            mockDraft,
            {
              contentFormat: 'text/markdown',
            }
          );
          expect(
            generatedAnswerActions.setAnswerContentFormat
          ).toHaveBeenCalledWith('text/markdown');
          expect(generatedAnswerActions.setIsStreaming).toHaveBeenCalledWith(
            true
          );
          expect(generatedAnswerActions.setIsLoading).toHaveBeenCalledWith(
            false
          );
          expect(mockDispatch).toHaveBeenCalledTimes(3);
        });

        it('should not dispatch when contentFormat is missing', () => {
          const message: Message = {
            payloadType: 'genqa.headerMessageType',
            payload: JSON.stringify({}),
          };

          headAnswerStrategy.events.handleMessage['genqa.headerMessageType']!(
            message,
            mockUpdateCachedData,
            mockDispatch
          );

          expect(mockUpdateCachedData).not.toHaveBeenCalled();
          expect(mockDispatch).not.toHaveBeenCalled();
        });
      });

      describe('genqa.messageType', () => {
        it('should handle message with textDelta', () => {
          const message: Message = {
            payloadType: 'genqa.messageType',
            payload: JSON.stringify({textDelta: 'Hello world'}),
          };
          vi.spyOn(generatedAnswerActions, 'updateMessage').mockReturnValue({
            type: 'updateMessage',
          } as any);

          headAnswerStrategy.events.handleMessage['genqa.messageType']!(
            message,
            mockUpdateCachedData,
            mockDispatch
          );

          expect(mockUpdateCachedData).toHaveBeenCalled();
          expect(eventHandlers.handleMessage).toHaveBeenCalledWith(mockDraft, {
            textDelta: 'Hello world',
          });
          expect(generatedAnswerActions.updateMessage).toHaveBeenCalledWith({
            textDelta: 'Hello world',
          });
          expect(mockDispatch).toHaveBeenCalledWith({type: 'updateMessage'});
        });

        it('should not dispatch when textDelta is missing', () => {
          const message: Message = {
            payloadType: 'genqa.messageType',
            payload: JSON.stringify({}),
          };

          headAnswerStrategy.events.handleMessage['genqa.messageType']!(
            message,
            mockUpdateCachedData,
            mockDispatch
          );

          expect(mockUpdateCachedData).not.toHaveBeenCalled();
          expect(mockDispatch).not.toHaveBeenCalled();
        });
      });

      describe('genqa.citationsType', () => {
        it('should handle citations', () => {
          const citations = [
            {
              id: 'citation-1',
              title: 'Test Citation',
              uri: 'https://example.com',
              permanentid: 'perm-1',
              clickUri: 'https://example.com/click',
            },
          ];
          const message: Message = {
            payloadType: 'genqa.citationsType',
            payload: JSON.stringify({citations}),
          };
          vi.spyOn(generatedAnswerActions, 'updateCitations').mockReturnValue({
            type: 'updateCitations',
          } as any);

          headAnswerStrategy.events.handleMessage['genqa.citationsType']!(
            message,
            mockUpdateCachedData,
            mockDispatch
          );

          expect(mockUpdateCachedData).toHaveBeenCalled();
          expect(eventHandlers.handleCitations).toHaveBeenCalledWith(
            mockDraft,
            {citations}
          );
          expect(generatedAnswerActions.updateCitations).toHaveBeenCalledWith({
            citations,
          });
          expect(mockDispatch).toHaveBeenCalledWith({type: 'updateCitations'});
        });

        it('should not dispatch when citations are missing', () => {
          const message: Message = {
            payloadType: 'genqa.citationsType',
            payload: JSON.stringify({}),
          };

          headAnswerStrategy.events.handleMessage['genqa.citationsType']!(
            message,
            mockUpdateCachedData,
            mockDispatch
          );

          expect(mockUpdateCachedData).not.toHaveBeenCalled();
          expect(mockDispatch).not.toHaveBeenCalled();
        });
      });

      describe('genqa.endOfStreamType', () => {
        it('should handle end of stream and propagate answerGenerated correctly', () => {
          const answerGenerated = true;

          const message: Message = {
            payloadType: 'genqa.endOfStreamType',
            payload: JSON.stringify({answerGenerated}),
          };

          vi.spyOn(
            generatedAnswerActions,
            'setIsAnswerGenerated'
          ).mockReturnValue({type: 'setIsAnswerGenerated'} as any);
          vi.spyOn(generatedAnswerActions, 'setIsStreaming').mockReturnValue({
            type: 'setIsStreaming',
          } as any);
          vi.spyOn(generatedAnswerActions, 'setIsLoading').mockReturnValue({
            type: 'setIsLoading',
          } as any);
          vi.spyOn(
            generatedAnswerAnalyticsActions,
            'logGeneratedAnswerStreamEnd'
          ).mockReturnValue({type: 'logStreamEnd'} as any);
          vi.spyOn(
            generatedAnswerAnalyticsActions,
            'logGeneratedAnswerResponseLinked'
          ).mockReturnValue({type: 'logResponseLinked'} as any);

          headAnswerStrategy.events.handleMessage['genqa.endOfStreamType']!(
            message,
            mockUpdateCachedData,
            mockDispatch
          );

          expect(mockUpdateCachedData).toHaveBeenCalled();
          expect(eventHandlers.handleEndOfStream).toHaveBeenCalledWith(
            mockDraft,
            {answerGenerated}
          );
          expect(
            generatedAnswerActions.setIsAnswerGenerated
          ).toHaveBeenCalledWith(answerGenerated);
          expect(generatedAnswerActions.setIsStreaming).toHaveBeenCalledWith(
            false
          );
          expect(generatedAnswerActions.setIsLoading).toHaveBeenCalledWith(
            false
          );
          expect(
            generatedAnswerAnalyticsActions.logGeneratedAnswerStreamEnd
          ).toHaveBeenCalledWith(answerGenerated);
          expect(
            generatedAnswerAnalyticsActions.logGeneratedAnswerResponseLinked
          ).toHaveBeenCalled();
          expect(mockDispatch).toHaveBeenCalledTimes(5);
        });
      });

      describe('error', () => {
        it('should handle error message with errorMessage and ERROR finishReason', () => {
          const message: Message = {
            payloadType: 'genqa.messageType',
            payload: '',
            finishReason: 'ERROR',
            errorMessage: 'Something went wrong',
            code: 500,
          };

          headAnswerStrategy.events.handleMessage.error!(
            message,
            mockUpdateCachedData,
            mockDispatch
          );

          expect(mockUpdateCachedData).toHaveBeenCalled();
          expect(eventHandlers.handleError).toHaveBeenCalledWith(
            mockDraft,
            message
          );
        });

        it('should not handle error when finishReason is not ERROR', () => {
          const message: Message = {
            payloadType: 'genqa.messageType',
            payload: '',
            finishReason: 'COMPLETED',
            errorMessage: 'Something went wrong',
          };

          headAnswerStrategy.events.handleMessage.error!(
            message,
            mockUpdateCachedData,
            mockDispatch
          );

          expect(mockUpdateCachedData).not.toHaveBeenCalled();
          expect(eventHandlers.handleError).not.toHaveBeenCalled();
        });
      });
    });
  });
});
