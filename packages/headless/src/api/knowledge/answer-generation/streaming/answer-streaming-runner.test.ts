/** biome-ignore-all lint/suspicious/noExplicitAny: unit test */
import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fetchEventSource} from '../../../../utils/fetch-event-source/fetch.js';
import type {GeneratedAnswerServerState} from '../answer-generation-api-state.js';
import {streamAnswerWithStrategy} from './answer-streaming-runner.js';
import {serverStateEventHandler} from './server-state-event-handler/server-state-event-handler.js';
import type {Message, StreamingStrategy} from './types.js';

vi.mock('../../../../utils/fetch-event-source/fetch.js');
vi.mock('./server-state-event-handler/server-state-event-handler.js');

describe('answer-streaming-runner', () => {
  let mockStrategy: StreamingStrategy<any>;
  let mockGetState: () => any;
  let mockDispatch: ThunkDispatch<any, unknown, UnknownAction>;
  let mockUpdateCachedData: (
    updater: (draft: GeneratedAnswerServerState) => void
  ) => void;
  let mockState: any;
  let mockArgs: any;
  let endpointUrl: string;

  beforeEach(() => {
    vi.clearAllMocks();

    mockState = {
      configuration: {
        accessToken: 'test-access-token',
        organizationId: 'test-org',
      },
      generatedAnswer: {
        answerConfigurationId: 'test-config',
      },
    };

    mockGetState = vi.fn(() => mockState);
    mockDispatch = vi.fn() as any;
    mockUpdateCachedData = vi.fn();

    mockStrategy = {
      handleOpen: vi.fn(),
      handleClose: vi.fn(),
      handleError: vi.fn(),
      handleMessage: {
        'genqa.headerMessageType': vi.fn(),
        'genqa.messageType': vi.fn(),
        'genqa.citationsType': vi.fn(),
        'genqa.endOfStreamType': vi.fn(),
        error: vi.fn(),
      },
    };

    mockArgs = {
      query: 'test query',
    };

    endpointUrl = 'https://test.coveo.com/answer/v1/generate';

    vi.mocked(fetchEventSource).mockResolvedValue(undefined);

    vi.mocked(serverStateEventHandler).handleOpen = vi.fn();
    vi.mocked(serverStateEventHandler).handleError = vi.fn((error: unknown) => {
      throw error;
    });
    vi.mocked(serverStateEventHandler).handleMessage = {
      'genqa.headerMessageType': vi.fn(),
      'genqa.messageType': vi.fn(),
      'genqa.citationsType': vi.fn(),
      'genqa.endOfStreamType': vi.fn(),
      error: vi.fn(),
    };
  });

  describe('#streamAnswerWithStrategy', () => {
    it('should use access token from state configuration', async () => {
      mockState.configuration.accessToken = 'custom-token-123';

      await streamAnswerWithStrategy(
        endpointUrl,
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      expect(fetchEventSource).toHaveBeenCalledWith(
        endpointUrl,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer custom-token-123',
          }),
        })
      );
    });

    it('should call fetchEventSource with correct parameters', async () => {
      await streamAnswerWithStrategy(
        endpointUrl,
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      expect(fetchEventSource).toHaveBeenCalledWith(
        endpointUrl,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockArgs),
          headers: {
            Authorization: 'Bearer test-access-token',
            Accept: 'text/event-stream',
            'Content-Type': 'application/json',
            'Accept-Encoding': '*',
          },
          fetch,
        })
      );
    });

    it('should pass onopen handler that calls serverStateEventHandler and strategy handleOpen', async () => {
      let capturedOnOpen: ((response: Response) => Promise<void>) | undefined;

      vi.mocked(fetchEventSource).mockImplementation(
        async (_url, options: any) => {
          capturedOnOpen = options.onopen;
        }
      );

      await streamAnswerWithStrategy(
        endpointUrl,
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      expect(capturedOnOpen).toBeDefined();

      const mockResponse = new Response(null, {
        headers: {'x-answer-id': 'test-id'},
      });
      await capturedOnOpen!(mockResponse);

      expect(serverStateEventHandler.handleOpen).toHaveBeenCalledWith(
        mockResponse,
        mockUpdateCachedData
      );
      expect(mockStrategy.handleOpen).toHaveBeenCalledWith(
        mockResponse,
        mockDispatch
      );
    });

    it('should pass onclose handler that calls strategy.handleClose', async () => {
      let capturedOnClose: (() => void) | undefined;

      vi.mocked(fetchEventSource).mockImplementation(
        async (_url, options: any) => {
          capturedOnClose = options.onclose;
        }
      );

      await streamAnswerWithStrategy(
        endpointUrl,
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      expect(capturedOnClose).toBeDefined();

      capturedOnClose!();

      expect(mockStrategy.handleClose).toHaveBeenCalledWith(mockDispatch);
    });

    it('should pass onmessage handler that calls error handlers', async () => {
      let capturedOnMessage: ((event: {data: string}) => void) | undefined;

      vi.mocked(fetchEventSource).mockImplementation(
        async (_url, options: any) => {
          capturedOnMessage = options.onmessage;
        }
      );

      await streamAnswerWithStrategy(
        endpointUrl,
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      expect(capturedOnMessage).toBeDefined();

      const message: Required<Message> = {
        payloadType: 'genqa.messageType',
        payload: JSON.stringify({textDelta: 'test'}),
        finishReason: 'ERROR',
        errorMessage: 'Test error',
        code: 500,
      };

      capturedOnMessage!({data: JSON.stringify(message)});

      expect(serverStateEventHandler.handleMessage.error).toHaveBeenCalledWith(
        message,
        mockUpdateCachedData
      );
      expect(mockStrategy.handleMessage.error).toHaveBeenCalledWith(
        message,
        mockDispatch
      );
    });

    it('should pass onmessage handler that calls specific message type handlers', async () => {
      let capturedOnMessage: ((event: {data: string}) => void) | undefined;

      vi.mocked(fetchEventSource).mockImplementation(
        async (_url, options: any) => {
          capturedOnMessage = options.onmessage;
        }
      );

      await streamAnswerWithStrategy(
        endpointUrl,
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      const message: Required<Message> = {
        payloadType: 'genqa.messageType',
        payload: JSON.stringify({textDelta: 'test'}),
        finishReason: 'COMPLETED',
        errorMessage: '',
        code: 200,
      };

      capturedOnMessage!({data: JSON.stringify(message)});

      expect(
        serverStateEventHandler.handleMessage['genqa.messageType']
      ).toHaveBeenCalledWith(message, mockUpdateCachedData);
      expect(
        mockStrategy.handleMessage['genqa.messageType']
      ).toHaveBeenCalledWith(message, mockDispatch);
    });

    it('should handle header message type', async () => {
      let capturedOnMessage: ((event: {data: string}) => void) | undefined;

      vi.mocked(fetchEventSource).mockImplementation(
        async (_url, options: any) => {
          capturedOnMessage = options.onmessage;
        }
      );

      await streamAnswerWithStrategy(
        endpointUrl,
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      const message: Required<Message> = {
        payloadType: 'genqa.headerMessageType',
        payload: JSON.stringify({contentFormat: 'text/markdown'}),
        finishReason: '',
        errorMessage: '',
        code: 200,
      };

      capturedOnMessage!({data: JSON.stringify(message)});

      expect(
        serverStateEventHandler.handleMessage['genqa.headerMessageType']
      ).toHaveBeenCalledWith(message, mockUpdateCachedData);
      expect(
        mockStrategy.handleMessage['genqa.headerMessageType']
      ).toHaveBeenCalledWith(message, mockDispatch);
    });

    it('should handle citations message type', async () => {
      let capturedOnMessage: ((event: {data: string}) => void) | undefined;

      vi.mocked(fetchEventSource).mockImplementation(
        async (_url, options: any) => {
          capturedOnMessage = options.onmessage;
        }
      );

      await streamAnswerWithStrategy(
        endpointUrl,
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      const message: Required<Message> = {
        payloadType: 'genqa.citationsType',
        payload: JSON.stringify({citations: []}),
        finishReason: '',
        errorMessage: '',
        code: 200,
      };

      capturedOnMessage!({data: JSON.stringify(message)});

      expect(
        serverStateEventHandler.handleMessage['genqa.citationsType']
      ).toHaveBeenCalledWith(message, mockUpdateCachedData);
      expect(
        mockStrategy.handleMessage['genqa.citationsType']
      ).toHaveBeenCalledWith(message, mockDispatch);
    });

    it('should handle end of stream message type', async () => {
      let capturedOnMessage: ((event: {data: string}) => void) | undefined;

      vi.mocked(fetchEventSource).mockImplementation(
        async (_url, options: any) => {
          capturedOnMessage = options.onmessage;
        }
      );

      await streamAnswerWithStrategy(
        endpointUrl,
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      const message: Required<Message> = {
        payloadType: 'genqa.endOfStreamType',
        payload: JSON.stringify({answerGenerated: true}),
        finishReason: '',
        errorMessage: '',
        code: 200,
      };

      capturedOnMessage!({data: JSON.stringify(message)});

      expect(
        serverStateEventHandler.handleMessage['genqa.endOfStreamType']
      ).toHaveBeenCalledWith(message, mockUpdateCachedData);
      expect(
        mockStrategy.handleMessage['genqa.endOfStreamType']
      ).toHaveBeenCalledWith(message, mockDispatch);
    });
  });
});
