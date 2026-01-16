/** biome-ignore-all lint/suspicious/noExplicitAny: unit test */
import {beforeEach, describe, expect, it, vi} from 'vitest';
import * as fetchEventSource from '../../../../utils/fetch-event-source/fetch.js';
import {streamAnswerWithStrategy} from './answer-streaming-runner.js';
import type {Message, StreamingStrategy} from './strategies/types.js';

vi.mock('../../../../utils/fetch-event-source/fetch.js');

describe('answer-streaming-runner', () => {
  let mockStrategy: StreamingStrategy<any, any>;
  let mockGetState: ReturnType<typeof vi.fn>;
  let mockDispatch: ReturnType<typeof vi.fn>;
  let mockUpdateCachedData: ReturnType<typeof vi.fn>;
  let mockState: any;
  let mockArgs: any;

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
    mockDispatch = vi.fn();
    mockUpdateCachedData = vi.fn();

    mockStrategy = {
      buildEndpointUrl: vi.fn(
        () => 'https://test.coveo.com/answer/v1/generate'
      ),
      events: {
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
      },
    };

    mockArgs = {
      query: 'test query',
      answerConfigurationId: 'test-config',
    };

    vi.spyOn(fetchEventSource, 'fetchEventSource').mockResolvedValue(undefined);
  });

  describe('#streamAnswerWithStrategy', () => {
    it('should call buildEndpointUrl with state', async () => {
      await streamAnswerWithStrategy(
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      expect(mockGetState).toHaveBeenCalled();
      expect(mockStrategy.buildEndpointUrl).toHaveBeenCalledWith(mockState);
    });

    it('should use access token from state configuration', async () => {
      mockState.configuration.accessToken = 'custom-token-123';

      await streamAnswerWithStrategy(
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      expect(fetchEventSource.fetchEventSource).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer custom-token-123',
          }),
        })
      );
    });

    it('should call fetchEventSource with correct parameters', async () => {
      await streamAnswerWithStrategy(
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      expect(fetchEventSource.fetchEventSource).toHaveBeenCalledWith(
        'https://test.coveo.com/answer/v1/generate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockArgs),
          headers: {
            Authorization: 'Bearer test-access-token',
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Accept-Encoding': '*',
          },
          fetch,
        })
      );
    });

    it('should pass onopen handler that calls strategy.handleOpen', async () => {
      let capturedOnOpen: ((response: Response) => Promise<void>) | undefined;

      vi.spyOn(fetchEventSource, 'fetchEventSource').mockImplementation(
        async (_url, options: any) => {
          capturedOnOpen = options.onopen;
        }
      );

      await streamAnswerWithStrategy(
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

      expect(mockStrategy.events.handleOpen).toHaveBeenCalledWith(
        mockResponse,
        mockUpdateCachedData,
        mockDispatch
      );
    });

    it('should pass onclose handler that calls strategy.handleClose', async () => {
      let capturedOnClose: (() => void) | undefined;

      vi.spyOn(fetchEventSource, 'fetchEventSource').mockImplementation(
        async (_url, options: any) => {
          capturedOnClose = options.onclose;
        }
      );

      await streamAnswerWithStrategy(
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

      expect(mockStrategy.events.handleClose).toHaveBeenCalledWith(
        mockUpdateCachedData,
        mockDispatch
      );
    });

    it('should pass onerror handler that calls strategy.handleError', async () => {
      let capturedOnError: ((error: unknown) => void) | undefined;

      vi.spyOn(fetchEventSource, 'fetchEventSource').mockImplementation(
        async (_url, options: any) => {
          capturedOnError = options.onerror;
        }
      );

      await streamAnswerWithStrategy(
        mockArgs,
        {
          getState: mockGetState,
          dispatch: mockDispatch,
          updateCachedData: mockUpdateCachedData,
        },
        mockStrategy
      );

      expect(capturedOnError).toBeDefined();

      const testError = new Error('Test error');
      capturedOnError!(testError);

      expect(mockStrategy.events.handleError).toHaveBeenCalledWith(testError);
    });

    it('should pass onmessage handler that calls error handler first', async () => {
      let capturedOnMessage: ((event: {data: string}) => void) | undefined;

      vi.spyOn(fetchEventSource, 'fetchEventSource').mockImplementation(
        async (_url, options: any) => {
          capturedOnMessage = options.onmessage;
        }
      );

      await streamAnswerWithStrategy(
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

      expect(mockStrategy.events.handleMessage.error).toHaveBeenCalledWith(
        message,
        mockUpdateCachedData,
        mockDispatch
      );
    });

    it('should pass onmessage handler that calls specific message type handler', async () => {
      let capturedOnMessage: ((event: {data: string}) => void) | undefined;

      vi.spyOn(fetchEventSource, 'fetchEventSource').mockImplementation(
        async (_url, options: any) => {
          capturedOnMessage = options.onmessage;
        }
      );

      await streamAnswerWithStrategy(
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
        mockStrategy.events.handleMessage['genqa.messageType']
      ).toHaveBeenCalledWith(message, mockUpdateCachedData, mockDispatch);
    });

    it('should handle header message type', async () => {
      let capturedOnMessage: ((event: {data: string}) => void) | undefined;

      vi.spyOn(fetchEventSource, 'fetchEventSource').mockImplementation(
        async (_url, options: any) => {
          capturedOnMessage = options.onmessage;
        }
      );

      await streamAnswerWithStrategy(
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
        mockStrategy.events.handleMessage['genqa.headerMessageType']
      ).toHaveBeenCalledWith(message, mockUpdateCachedData, mockDispatch);
    });

    it('should handle citations message type', async () => {
      let capturedOnMessage: ((event: {data: string}) => void) | undefined;

      vi.spyOn(fetchEventSource, 'fetchEventSource').mockImplementation(
        async (_url, options: any) => {
          capturedOnMessage = options.onmessage;
        }
      );

      await streamAnswerWithStrategy(
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
        mockStrategy.events.handleMessage['genqa.citationsType']
      ).toHaveBeenCalledWith(message, mockUpdateCachedData, mockDispatch);
    });

    it('should handle end of stream message type', async () => {
      let capturedOnMessage: ((event: {data: string}) => void) | undefined;

      vi.spyOn(fetchEventSource, 'fetchEventSource').mockImplementation(
        async (_url, options: any) => {
          capturedOnMessage = options.onmessage;
        }
      );

      await streamAnswerWithStrategy(
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
        mockStrategy.events.handleMessage['genqa.endOfStreamType']
      ).toHaveBeenCalledWith(message, mockUpdateCachedData, mockDispatch);
    });
  });
});
