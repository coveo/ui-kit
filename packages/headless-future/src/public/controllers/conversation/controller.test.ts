import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine, nextTick} from '@/src/test/test-utils.js';
import type {Engine} from '@/src/core/interface/engine/engine.js';
import {
  buildConversationController,
  type ConversationController,
} from './controller.js';
import {CONVERSATION_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import type {PersistenceAdapter} from '@/src/api/adapters/types.js';

describe('buildConversationController persistence integration', () => {
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
      transport: {
        send: vi.fn(async () => ({status: 200, data: {}})),
        openStream: vi.fn(async (request) => {
          request.onClose();
        }),
        abort: vi.fn(),
      },
      auth: {
        getToken: vi.fn(async () => 'token'),
        refreshToken: vi.fn(async () => 'token'),
        getTokenMetadata: vi.fn(() => ({})),
      },
      persistence,
    });
  });

  it('hydrates conversation state from persistence on startup', async () => {
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
        sessionId: 's1',
        createdAt: 1,
        updatedAt: 1,
      },
      isLoading: false,
      error: null,
    });

    controller = buildConversationController(engine, {
      transport: {
        send: vi.fn(async () => ({status: 200, data: {}})),
        openStream: vi.fn(async (request) => {
          request.onClose();
        }),
        abort: vi.fn(),
      },
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
  });

  it('persists conversation changes during submitTurn', async () => {
    await nextTick();

    await controller.submitTurn('hello');

    expect(persistence.save).toHaveBeenCalledWith(
      CONVERSATION_PERSISTENCE_KEY,
      expect.objectContaining({
        messages: expect.any(Array),
        turns: expect.any(Array),
      })
    );
  });

  it('deletes persisted key when conversation is cleared', async () => {
    await nextTick();

    controller.clearConversation();

    expect(persistence.delete).toHaveBeenCalledWith(
      CONVERSATION_PERSISTENCE_KEY
    );
  });
});
