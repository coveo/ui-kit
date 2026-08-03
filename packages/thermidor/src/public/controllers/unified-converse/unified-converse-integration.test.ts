import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Engine} from '@/src/internal/engine/index.js';
import {
  buildGenerativeUnifiedInterface,
  type GenerativeUnifiedInterface,
} from '@/src/public/interfaces/generative-unified.js';
import {
  buildUnifiedConverseController,
  type UnifiedConverseController,
} from './unified-converse-controller.js';
import {buildUnifiedConverseController as barrelExport} from '@/src/public/controllers/index.js';
import {buildPaginationController} from '@/src/public/controllers/pagination/pagination-controller.js';

// ---------------------------------------------------------------------------
// Mock: createUnifiedEndpointClient
// ---------------------------------------------------------------------------

const mockClient = vi.hoisted(() => ({call: vi.fn()}));

vi.mock('@/src/internal/api/unified/unified-endpoint-client.js', () => ({
  createUnifiedEndpointClient: () => mockClient,
}));

// ---------------------------------------------------------------------------
// SSE Stream Factory
// ---------------------------------------------------------------------------

interface SSEEvent {
  event?: string;
  data: string;
}

function createSSEStream(events: SSEEvent[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = events.map((e) => {
    const eventField = e.event ? `event: ${e.event}\n` : '';
    const dataField = `data: ${e.data}\n`;
    return encoder.encode(`${eventField}${dataField}\n`);
  });

  let index = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(chunks[index]);
        index++;
      } else {
        controller.close();
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const textResponseEvents: SSEEvent[] = [
  {
    event: 'turn_started',
    data: JSON.stringify({conversationSessionId: 'session-1', conversationToken: 'token-1'}),
  },
  {event: 'message', data: JSON.stringify({type: 'RUN_STARTED'})},
  {
    event: 'message',
    data: JSON.stringify({type: 'TEXT_MESSAGE_START', messageId: 'msg-1', role: 'assistant'}),
  },
  {
    event: 'message',
    data: JSON.stringify({
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: 'msg-1',
      delta: 'Here are some hiking boots',
    }),
  },
  {event: 'message', data: JSON.stringify({type: 'TEXT_MESSAGE_END', messageId: 'msg-1'})},
  {event: 'message', data: JSON.stringify({type: 'RUN_FINISHED'})},
  {
    event: 'turn_complete',
    data: JSON.stringify({conversationSessionId: 'session-1', conversationToken: 'token-1'}),
  },
];

const surfaceCreationEvents: SSEEvent[] = [
  {
    event: 'turn_started',
    data: JSON.stringify({conversationSessionId: 'session-1', conversationToken: 'token-1'}),
  },
  {event: 'message', data: JSON.stringify({type: 'RUN_STARTED'})},
  {
    event: 'message',
    data: JSON.stringify({
      type: 'ACTIVITY_SNAPSHOT',
      activityType: 'a2ui-surface',
      content: {
        operations: [
          {
            createSurface: {
              surfaceId: 'surface-1',
              dataModel: {
                responseId: 'resp-1',
                products: [
                  {permanentid: 'p1', ec_name: 'Boot A', ec_price: 99.99, additionalFields: {}},
                  {permanentid: 'p2', ec_name: 'Boot B', ec_price: 129.99, additionalFields: {}},
                ],
                results: [],
                pagination: {page: 0, perPage: 20, totalEntries: 100, totalPages: 5},
                facets: [],
                sort: {
                  appliedSort: {sortCriteria: 'relevance'},
                  availableSorts: [{sortCriteria: 'relevance'}],
                },
                triggers: [],
              },
            },
          },
        ],
      },
    }),
  },
  {event: 'message', data: JSON.stringify({type: 'RUN_FINISHED'})},
  {
    event: 'turn_complete',
    data: JSON.stringify({conversationSessionId: 'session-1', conversationToken: 'token-1'}),
  },
];

const actionResponseEvents: SSEEvent[] = [
  {
    event: 'turn_started',
    data: JSON.stringify({conversationSessionId: 'session-1', conversationToken: 'token-1'}),
  },
  {event: 'message', data: JSON.stringify({type: 'RUN_STARTED'})},
  {
    event: 'message',
    data: JSON.stringify({
      type: 'ACTIVITY_SNAPSHOT',
      activityType: 'a2ui-surface',
      content: {
        operations: [
          {
            updateDataModel: {
              surfaceId: 'surface-1',
              path: '/pagination',
              value: {page: 1, perPage: 20, totalEntries: 100},
            },
          },
          {
            updateDataModel: {
              surfaceId: 'surface-1',
              path: '/products',
              value: [
                {permanentid: 'p3', ec_name: 'Boot C', ec_price: 149.99},
                {permanentid: 'p4', ec_name: 'Boot D', ec_price: 179.99},
              ],
            },
          },
        ],
      },
    }),
  },
  {event: 'message', data: JSON.stringify({type: 'RUN_FINISHED'})},
  {
    event: 'turn_complete',
    data: JSON.stringify({conversationSessionId: 'session-1', conversationToken: 'token-1'}),
  },
];

const errorEvents: SSEEvent[] = [
  {
    event: 'turn_started',
    data: JSON.stringify({conversationSessionId: 'session-1', conversationToken: 'token-1'}),
  },
  {event: 'message', data: JSON.stringify({type: 'RUN_STARTED'})},
  {event: 'message', data: JSON.stringify({type: 'RUN_ERROR', message: 'Something went wrong'})},
];

const incompleteStreamEvents: SSEEvent[] = [
  {
    event: 'turn_started',
    data: JSON.stringify({conversationSessionId: 'session-1', conversationToken: 'token-1'}),
  },
  {event: 'message', data: JSON.stringify({type: 'RUN_STARTED'})},
  {
    event: 'message',
    data: JSON.stringify({type: 'TEXT_MESSAGE_START', messageId: 'msg-1', role: 'assistant'}),
  },
];

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('UnifiedConverseController integration', () => {
  let engine: Engine;
  let generativeInterface: GenerativeUnifiedInterface;
  let controller: UnifiedConverseController;

  beforeEach(() => {
    vi.clearAllMocks();

    engine = new Engine({
      configuration: {organizationId: 'test-org', accessToken: 'test-token'},
    });

    generativeInterface = buildGenerativeUnifiedInterface({engine, id: 'test-unified'});

    controller = buildUnifiedConverseController({interface: generativeInterface});
  });

  describe('text response round-trip', () => {
    it('accumulates text deltas into the turn agent response', async () => {
      mockClient.call.mockReturnValue({
        success: true,
        data: {stream: createSSEStream(textResponseEvents)},
      });

      controller.submit({prompt: 'Show me hiking boots'});

      await vi.waitFor(() => {
        expect(controller.state.turns[0]?.status).toBe('complete');
      });

      const turn = controller.state.turns[0];
      expect(controller.state.turns.length).toBe(1);
      expect(turn.status).toBe('complete');
      expect(turn.prompt).toBe('Show me hiking boots');
      expect(turn.agentResponse?.messages[0].content).toBe('Here are some hiking boots');
      expect(turn.agentResponse?.messages[0].role).toBe('assistant');
      expect(controller.state.isStreaming).toBe(false);
    });
  });

  describe('surface hydration', () => {
    it('creates a routedInterface with commerceSearch useCase', async () => {
      mockClient.call.mockReturnValue({
        success: true,
        data: {stream: createSSEStream(surfaceCreationEvents)},
      });

      controller.submit({prompt: 'Show me boots'});

      await vi.waitFor(() => {
        expect(controller.state.turns[0]?.status).toBe('complete');
      });

      const turn = controller.state.turns[0];
      expect(turn.routedInterface).toBeDefined();
      expect(turn.routedInterface?.useCase).toBe('commerceSearch');
      expect(turn.routedInterface?.interface).toBeDefined();

      const paginationController = buildPaginationController({
        interface: turn.routedInterface!.interface,
      });
      expect(paginationController.state.totalCount).toBe(100);
      expect(paginationController.state.pageSize).toBe(20);
      expect(paginationController.state.page).toBe(0);
    });
  });

  describe('surface interaction', () => {
    it('updates pagination state after selectPage and updateDataModel', async () => {
      mockClient.call
        .mockReturnValueOnce({
          success: true,
          data: {stream: createSSEStream(surfaceCreationEvents)},
        })
        .mockReturnValueOnce({
          success: true,
          data: {stream: createSSEStream(actionResponseEvents)},
        });

      controller.submit({prompt: 'Show me boots'});

      await vi.waitFor(() => {
        expect(controller.state.turns[0]?.status).toBe('complete');
      });

      const turn = controller.state.turns[0];
      const paginationController = buildPaginationController({
        interface: turn.routedInterface!.interface,
      });

      expect(paginationController.state.page).toBe(0);
      expect(paginationController.state.pageSize).toBe(20);
      expect(paginationController.state.totalCount).toBe(100);

      paginationController.selectPage(1);

      await vi.waitFor(() => {
        expect(paginationController.state.page).toBe(1);
      });

      expect(paginationController.state.totalCount).toBe(100);
      expect(paginationController.state.pageSize).toBe(20);
    });
  });

  describe('error handling', () => {
    it('transitions turn to error on RUN_ERROR', async () => {
      mockClient.call.mockResolvedValueOnce({
        success: true,
        data: {stream: createSSEStream(errorEvents)},
      });

      controller.submit({prompt: 'trigger error'});

      await vi.waitFor(() => {
        const turn = controller.state.turns[0];
        expect(turn.status).toBe('error');
        expect(turn.error).toBe('Something went wrong');
        expect(controller.state.isStreaming).toBe(false);
      });
    });

    it('transitions turn to error on incomplete stream', async () => {
      mockClient.call.mockResolvedValueOnce({
        success: true,
        data: {stream: createSSEStream(incompleteStreamEvents)},
      });

      controller.submit({prompt: 'incomplete'});

      await vi.waitFor(() => {
        const turn = controller.state.turns[0];
        expect(turn.status).toBe('error');
        expect(turn.error).toContain('Stream ended without a terminal event');
        expect(controller.state.isStreaming).toBe(false);
      });
    });

    it('transitions turn to error on API call failure', async () => {
      mockClient.call.mockResolvedValueOnce({
        success: false,
        error: 'Network timeout',
      });

      controller.submit({prompt: 'fail'});

      await vi.waitFor(() => {
        const turn = controller.state.turns[0];
        expect(turn.status).toBe('error');
        expect(turn.error).toBe('Network timeout');
        expect(controller.state.isStreaming).toBe(false);
      });
    });
  });

  describe('cancel', () => {
    it('aborts the stream and marks the turn as cancelled', async () => {
      const hangingStream = new ReadableStream<Uint8Array>({
        start(ctrl) {
          const encoder = new TextEncoder();
          ctrl.enqueue(encoder.encode('event: turn_started\ndata: {}\n\n'));
        },
      });

      mockClient.call.mockReturnValue({
        success: true,
        data: {stream: hangingStream},
      });

      controller.submit({prompt: 'cancel me'});

      await vi.waitFor(() => {
        expect(controller.state.isStreaming).toBe(true);
      });

      controller.cancel();

      await vi.waitFor(() => {
        expect(controller.state.turns[0]?.status).toBe('error');
      });

      const turn = controller.state.turns[0];
      expect(turn.error).toBe('Cancelled');
      expect(controller.state.isStreaming).toBe(false);
    });
  });

  describe('retry', () => {
    it('resubmits a failed turn and produces a successful response', async () => {
      mockClient.call
        .mockResolvedValueOnce({
          success: true,
          data: {stream: createSSEStream(errorEvents)},
        })
        .mockResolvedValueOnce({
          success: true,
          data: {stream: createSSEStream(textResponseEvents)},
        });

      controller.submit({prompt: 'retry me'});

      await vi.waitFor(() => {
        expect(controller.state.turns[0]?.status).toBe('error');
      });

      const failedTurn = controller.state.turns[0];
      controller.retry({id: failedTurn.id});

      await vi.waitFor(() => {
        expect(controller.state.turns[0]?.status).toBe('complete');
        expect(controller.state.isStreaming).toBe(false);
      });

      const turn = controller.state.turns[0];
      expect(turn.agentResponse?.messages[0].content).toBe('Here are some hiking boots');
    });
  });

  describe('barrel export', () => {
    it('exports buildUnifiedConverseController from the controllers barrel', () => {
      expect(barrelExport).toBe(buildUnifiedConverseController);
    });
  });
});
