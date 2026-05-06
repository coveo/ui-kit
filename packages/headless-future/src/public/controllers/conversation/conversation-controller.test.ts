import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine, nextTick} from '@/src/test/test-utils.js';
import type {Engine} from '@/src/core/interface/engine/engine.js';
import {
  buildConversationController,
  type ConversationController,
} from './conversation-controller.js';
import {CONVERSATION_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import type {
  PersistenceAdapter,
  StreamRequest,
  TransportAdapter,
} from '@/src/api/adapters/types.js';

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
  let persistence: PersistenceAdapter;

  const createController = (
    streamScript: StreamScript
  ): ConversationController => {
    engine = createTestEngine();

    return buildConversationController(engine, {
      transport: createScriptedTransport(streamScript),
      auth: {
        getToken: vi.fn(async () => 'token'),
        refreshToken: vi.fn(async () => 'token'),
        getTokenMetadata: vi.fn(() => ({})),
      },
      persistence,
    });
  };

  beforeEach(() => {
    persistence = {
      save: vi.fn(async () => undefined),
      load: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
      list: vi.fn(async () => []),
    };
  });

  it('hydrates from conversation checkpoint on startup', async () => {
    (persistence.load as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
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
        conversationSessionId: 's1',
        createdAt: 1,
        updatedAt: 1,
      },
      isLoading: false,
      error: null,
      structuredError: null,
      streaming: {
        isConnected: false,
        bytesReceived: 0,
        eventsReceived: 0,
        aborted: true,
        lastEventAt: 123,
      },
    });

    const controller = createController((request) => {
      request.onClose();
    });
    await nextTick();

    expect(controller.state.messages).toEqual([
      expect.objectContaining({id: 'm1', content: 'hello'}),
    ]);
    expect(controller.state.streaming.aborted).toBe(true);
    expect(controller.state.streaming.lastEventAt).toBe(123);
  });

  it('persists checkpoints during submitTurn initialization and finalization', async () => {
    const controller = createController((request) => {
      emitEvent(request, {
        type: 'RUN_FINISHED',
        threadId: 'thread-1',
        runId: 'run-1',
      });
      request.onClose();
    });

    await nextTick();

    const result = await controller.submitTurn('hello');
    expect(result.accepted).toBe(true);

    expect(persistence.save).toHaveBeenCalledWith(
      CONVERSATION_PERSISTENCE_KEY,
      expect.objectContaining({
        messages: expect.any(Array),
        turns: expect.any(Array),
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
    const controller = createController((request) => {
      request.onClose();
    });

    await nextTick();

    await controller.submitTurn('hello');

    expect(controller.state.activeTurnId).toBeNull();
    const turns = engine.read((state) => state.conversation?.turns ?? []);
    expect(turns).toHaveLength(1);
    expect(turns[0].status).toBe('completed_with_warnings');
    expect(turns[0].warningCodes).toContain('missing_terminal_event');
  });

  it('resets streaming telemetry at the start of each turn', async () => {
    let streamCallCount = 0;
    const controller = createController((request) => {
      streamCallCount += 1;

      if (streamCallCount === 1) {
        emitEvent(request, {
          type: 'TEXT_MESSAGE_CONTENT',
          messageId: 'assistant-ignored',
          delta: 'hello',
        });
        emitEvent(request, {
          type: 'RUN_FINISHED',
          threadId: 'thread-1',
          runId: 'run-1',
        });
        request.onClose();
        return;
      }

      emitEvent(request, {
        type: 'RUN_FINISHED',
        threadId: 'thread-2',
        runId: 'run-2',
      });
      request.onClose();
    });

    await nextTick();

    await controller.submitTurn('first');
    expect(controller.state.streaming.eventsReceived).toBe(2);

    await controller.submitTurn('second');
    expect(controller.state.streaming.eventsReceived).toBe(1);
  });

  it('keeps aborted as terminal when close fires after abort', async () => {
    const streamHandles: {
      request?: StreamRequest;
      resolve?: () => void;
    } = {};

    const controller = createController(
      (request) =>
        new Promise<void>((resolve) => {
          streamHandles.request = request;
          streamHandles.resolve = () => resolve();
        })
    );

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

  it('ignores late stream events after abort', async () => {
    const streamHandles: {
      request?: StreamRequest;
      resolve?: () => void;
    } = {};

    const controller = createController(
      (request) =>
        new Promise<void>((resolve) => {
          streamHandles.request = request;
          streamHandles.resolve = () => resolve();
        })
    );

    await nextTick();

    const submitPromise = controller.submitTurn('hello');
    await nextTick();

    const activeTurn = engine.read((state) => state.conversation?.turns?.[0]);
    expect(activeTurn).toBeDefined();
    if (!activeTurn) {
      throw new Error('expected active turn to exist');
    }

    const assistantMessageId = activeTurn.assistantMessageId;
    controller.abortTurn('manual-stop');

    const request = streamHandles.request;
    expect(request).toBeDefined();
    if (!request) {
      throw new Error('expected stream request to be captured');
    }

    emitEvent(request, {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: assistantMessageId,
      delta: 'late-content',
    });
    emitEvent(request, {
      type: 'RUN_FINISHED',
      threadId: 'thread-late',
      runId: 'run-late',
    });
    request.onClose();
    streamHandles.resolve?.();

    await submitPromise;

    const assistantMessage = engine.read((state) =>
      (state.conversation?.messages ?? []).find(
        (message) => message.id === assistantMessageId
      )
    );

    expect(assistantMessage?.content).toBe('');
    expect(controller.state.streaming.eventsReceived).toBe(0);

    const turns = engine.read((state) => state.conversation?.turns ?? []);
    expect(turns).toHaveLength(1);
    expect(turns[0].status).toBe('aborted');
  });

  it('retryTurn creates a new turn with lineage metadata', async () => {
    const controller = createController((request) => {
      emitEvent(request, {
        type: 'RUN_FINISHED',
        threadId: 'thread-1',
        runId: 'run-1',
      });
      request.onClose();
    });

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
    const controller = createController((request) => {
      emitEvent(request, {
        type: 'RUN_FINISHED',
        threadId: 'thread-1',
        runId: 'run-1',
      });
      request.onClose();
    });

    await nextTick();

    controller.clearConversation();

    expect(persistence.delete).toHaveBeenCalledWith(
      CONVERSATION_PERSISTENCE_KEY
    );
  });
});
