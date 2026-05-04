import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine, nextTick} from '@/src/test/test-utils.js';
import type {Engine} from '@/src/core/interface/engine/engine.js';
import {
  buildConversationController,
  type ConversationController,
} from './controller.js';
import {CONVERSATION_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import type {
  PersistenceAdapter,
  StreamRequest,
  TransportAdapter,
} from '@/src/api/adapters/types.js';
import * as streamingSelectors from '@/src/core/interface/streaming/selectors.js';

const encoder = new TextEncoder();

type StreamScript = (request: StreamRequest) => Promise<void> | void;

function createScriptedTransport(script: StreamScript): TransportAdapter {
  return {
    send: vi.fn(async () => ({status: 200, data: {}})),
    openStream: vi.fn(async (request) => {
      await script(request);
    }),
    abort: vi.fn(),
  };
}

function emitEvent(request: StreamRequest, payload: object): void {
  request.onChunk(
    encoder.encode(`event: message\ndata: ${JSON.stringify(payload)}\n\n`)
  );
}

describe('buildConversationController', () => {
  let engine: Engine;
  let controller: ConversationController;
  let persistence: PersistenceAdapter;

  beforeEach(() => {
    engine = createTestEngine();

    persistence = {
      save: vi.fn(async () => undefined),
      load: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
      list: vi.fn(async () => []),
    };

    controller = buildConversationController(engine, {
      transport: createScriptedTransport((request) => {
        emitEvent(request, {
          type: 'RUN_FINISHED',
          threadId: 'thread-1',
          runId: 'run-1',
        });
        request.onClose();
      }),
      auth: {
        getToken: vi.fn(async () => 'token'),
        refreshToken: vi.fn(async () => 'token'),
        getTokenMetadata: vi.fn(() => ({})),
      },
      persistence,
    });
  });

  it('hydrates from checkpoint envelope on startup', async () => {
    (persistence.load as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      conversation: {
        messages: [
          {
            id: 'm1',
            role: 'user',
            content: 'hello',
            createdAt: 1,
          },
        ],
        turns: [],
        activeTurnId: null,
        session: {
          sessionId: 's1',
          createdAt: 1,
          updatedAt: 1,
        },
        isLoading: false,
        error: null,
        structuredError: null,
      },
      streaming: {
        aborted: true,
        lastEventAt: 123,
      },
    });

    controller = buildConversationController(engine, {
      transport: createScriptedTransport((request) => {
        request.onClose();
      }),
      auth: {
        getToken: vi.fn(async () => 'token'),
        refreshToken: vi.fn(async () => 'token'),
        getTokenMetadata: vi.fn(() => ({})),
      },
      persistence,
    });

    await nextTick();

    expect(controller.state.messages).toEqual([
      expect.objectContaining({id: 'm1', content: 'hello'}),
    ]);
    expect(engine.read(streamingSelectors.aborted)).toBe(true);
    expect(engine.read(streamingSelectors.lastEventAt)).toBe(123);
  });

  it('persists checkpoints during submitTurn initialization and finalization', async () => {
    await nextTick();

    await controller.submitTurn('hello');

    expect(persistence.save).toHaveBeenCalledWith(
      CONVERSATION_PERSISTENCE_KEY,
      expect.objectContaining({
        conversation: expect.objectContaining({
          messages: expect.any(Array),
          turns: expect.any(Array),
        }),
        streaming: expect.objectContaining({
          aborted: expect.any(Boolean),
        }),
      })
    );
    expect(
      (persistence.save as ReturnType<typeof vi.fn>).mock.calls.length
    ).toBe(2);
  });

  it('marks turn as completed_with_warnings when stream closes without terminal event', async () => {
    controller = buildConversationController(engine, {
      transport: createScriptedTransport((request) => {
        request.onClose();
      }),
      auth: {
        getToken: vi.fn(async () => 'token'),
        refreshToken: vi.fn(async () => 'token'),
        getTokenMetadata: vi.fn(() => ({})),
      },
      persistence,
    });

    await nextTick();

    await controller.submitTurn('hello');

    expect(controller.state.activeTurn).toBeNull();
    const turns = engine.read((state) => state.conversation?.turns ?? []);
    expect(turns).toHaveLength(1);
    expect(turns[0].status).toBe('completed_with_warnings');
    expect(turns[0].warningCodes).toContain('missing_terminal_event');
  });

  it('keeps aborted as terminal when close fires after abort', async () => {
    const streamHandles: {
      request?: StreamRequest;
      resolve?: () => void;
    } = {};

    controller = buildConversationController(engine, {
      transport: createScriptedTransport(
        (request) =>
          new Promise<void>((resolve) => {
            streamHandles.request = request;
            streamHandles.resolve = () => resolve();
          })
      ),
      auth: {
        getToken: vi.fn(async () => 'token'),
        refreshToken: vi.fn(async () => 'token'),
        getTokenMetadata: vi.fn(() => ({})),
      },
      persistence,
    });

    await nextTick();

    const submitPromise = controller.submitTurn('hello');
    await nextTick();

    controller.abortTurn('manual-stop');
    streamHandles.request?.onClose();
    streamHandles.resolve?.();
    await submitPromise;

    const turns = engine.read((state) => state.conversation?.turns ?? []);
    expect(turns).toHaveLength(1);
    expect(turns[0].status).toBe('aborted');
    expect(turns[0].reason).toBe('manual-stop');
  });

  it('retryTurn creates a new turn with lineage metadata', async () => {
    await nextTick();

    await controller.submitTurn('hello');

    const firstTurn = engine.read((state) => state.conversation?.turns?.[0]);
    expect(firstTurn).toBeDefined();

    await controller.retryTurn(firstTurn!.id);

    const turns = engine.read((state) => state.conversation?.turns ?? []);
    expect(turns).toHaveLength(2);

    const messages = engine.read((state) => state.conversation?.messages ?? []);
    const getRetryOf = (metadata: unknown): string | undefined => {
      if (!metadata || typeof metadata !== 'object') {
        return undefined;
      }

      const retryOf = (metadata as Record<string, unknown>).retryOf;
      return typeof retryOf === 'string' ? retryOf : undefined;
    };

    const retriedUserMessage = messages.find(
      (message) => getRetryOf(message.metadata) === firstTurn!.id
    );

    expect(retriedUserMessage).toBeDefined();
    expect(retriedUserMessage?.content).toBe('hello');
  });

  it('deletes persisted key when conversation is cleared', async () => {
    await nextTick();

    controller.clearConversation();

    expect(persistence.delete).toHaveBeenCalledWith(
      CONVERSATION_PERSISTENCE_KEY
    );
  });
});
