import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import type {Engine} from '@/src/core/interface/engine/engine.js';
import {getFullEngine} from '@/src/core/interface/engine/engine.js';
import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import {surfacesSlice} from '@/src/core/internal/surfaces/surfaces-slice.js';
import type {
  PersistenceAdapter,
  StreamRequest,
  TransportAdapter,
} from '@/src/api/adapters/types.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import * as conversationSelectors from '@/src/core/interface/conversation/conversation-selectors.js';
import {getConversationRuntime, type ConversationRuntime} from './runtime.js';
import {defaultConversationIdStrategy} from './id-strategy.js';

type StreamScript = (request: StreamRequest) => Promise<void> | void;

const encoder = new TextEncoder();

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

describe('getConversationRuntime', () => {
  let engine: Engine;
  let persistence: PersistenceAdapter;

  const adoptConversationSlices = async (targetEngine: Engine) => {
    const fullEngine = getFullEngine(targetEngine);
    await fullEngine.adoptSlice(conversationSlice);
    await fullEngine.adoptSlice(surfacesSlice);
    return fullEngine;
  };

  const createRuntime = (
    transport: TransportAdapter,
    hooks?: {
      turn_initialized?: (turnId: string) => void;
      stream_opened?: (turnId: string) => void;
      stream_closed?: (turnId: string) => void;
      turn_finalized?: (turnId: string) => void;
    }
  ): ConversationRuntime =>
    getConversationRuntime(engine, {
      transport,
      persistence,
      idStrategy: defaultConversationIdStrategy,
      hooks,
    });

  beforeEach(async () => {
    engine = createTestEngine();

    persistence = {
      save: vi.fn(async () => undefined),
      load: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
      list: vi.fn(async () => []),
    };

    await adoptConversationSlices(engine);
  });

  it('returns the same runtime for repeated calls on the same engine', () => {
    const first = createRuntime(createScriptedTransport(() => undefined));
    const second = createRuntime(createScriptedTransport(() => undefined));

    expect(first).toBe(second);
  });

  it('returns a structured rejection when a turn is already active', async () => {
    const fullEngine = getFullEngine(engine);
    fullEngine.mutate(
      conversationMutators.addTurn({
        id: 'existing-turn',
        userMessageId: 'user-1',
        assistantMessageId: 'assistant-1',
        status: 'streaming',
        createdAt: Date.now(),
      })
    );
    fullEngine.mutate(conversationMutators.setActiveTurnId('existing-turn'));

    const runtime = createRuntime(createScriptedTransport(() => undefined));

    const result = await runtime.submitTurn('hello');

    expect(result).toEqual({
      accepted: false,
      reason: 'ACTIVE_TURN_IN_PROGRESS',
    });
  });

  it('isolates lifecycle hook failures from submit flow', async () => {
    const turnInitialized = vi.fn(() => {
      throw new Error('hook failed');
    });
    const turnFinalized = vi.fn();

    const runtime = createRuntime(
      createScriptedTransport((request) => {
        emitEvent(request, {
          type: 'RUN_FINISHED',
          threadId: 'thread-1',
          runId: 'run-1',
        });
        request.onClose();
      }),
      {
        turn_initialized: turnInitialized,
        turn_finalized: turnFinalized,
      }
    );

    const result = await runtime.submitTurn('hello');

    expect(result.accepted).toBe(true);
    expect(turnInitialized).toHaveBeenCalledOnce();
    expect(turnFinalized).toHaveBeenCalledOnce();

    const turns = getFullEngine(engine).read(conversationSelectors.turns);
    expect(turns).toHaveLength(1);
    expect(turns[0].status).toBe('completed');
  });

  it('persists checkpoints around submit turn execution', async () => {
    const runtime = createRuntime(
      createScriptedTransport((request) => {
        emitEvent(request, {
          type: 'RUN_FINISHED',
          threadId: 'thread-1',
          runId: 'run-1',
        });
        request.onClose();
      })
    );

    await runtime.submitTurn('hello');

    expect(persistence.save).toHaveBeenCalledTimes(2);
  });

  it('retries using snapshot token first and falls back to latest token', async () => {
    const observedTokens: Array<string | undefined> = [];

    const runtime = createRuntime(
      createScriptedTransport((request) => {
        const token =
          typeof request.body === 'object' && request.body
            ? (request.body as {conversationToken?: string}).conversationToken
            : undefined;

        observedTokens.push(token);

        if (token === 'old-token') {
          request.onError({code: 'TOKEN_EXPIRED', message: 'token expired'});
          return;
        }

        emitEvent(request, {
          type: 'RUN_FINISHED',
          threadId: 'thread-1',
          runId: 'run-1',
        });
        request.onClose();
      })
    );

    const fullEngine = getFullEngine(engine);
    fullEngine.mutate(
      conversationMutators.updateSession({
        sessionId: 'session-1',
        conversationToken: 'old-token',
      })
    );

    const firstSubmit = await runtime.submitTurn('hello');
    expect(firstSubmit.accepted).toBe(true);

    const firstTurn = fullEngine.read(conversationSelectors.turns)[0];
    expect(firstTurn).toBeDefined();
    expect(firstTurn.status).toBe('failed');

    fullEngine.mutate(
      conversationMutators.updateSession({conversationToken: 'latest-token'})
    );

    const retryResult = await runtime.retryTurn(firstTurn.id);

    expect(retryResult.accepted).toBe(true);
    expect(observedTokens).toEqual(['old-token', 'old-token', 'latest-token']);

    const turns = fullEngine.read(conversationSelectors.turns);
    expect(turns).toHaveLength(2);
    expect(turns[1].status).toBe('completed');
  });

  it('does not fallback to latest token on non-token failures', async () => {
    const observedTokens: Array<string | undefined> = [];

    const runtime = createRuntime(
      createScriptedTransport((request) => {
        const token =
          typeof request.body === 'object' && request.body
            ? (request.body as {conversationToken?: string}).conversationToken
            : undefined;

        observedTokens.push(token);

        if (token === 'old-token') {
          request.onError({code: 'NETWORK_ERROR', message: 'temporary outage'});
          return;
        }

        emitEvent(request, {
          type: 'RUN_FINISHED',
          threadId: 'thread-1',
          runId: 'run-1',
        });
        request.onClose();
      })
    );

    const fullEngine = getFullEngine(engine);
    fullEngine.mutate(
      conversationMutators.updateSession({
        sessionId: 'session-1',
        conversationToken: 'old-token',
      })
    );

    await runtime.submitTurn('hello');

    const firstTurn = fullEngine.read(conversationSelectors.turns)[0];
    expect(firstTurn).toBeDefined();
    expect(firstTurn.status).toBe('failed');

    fullEngine.mutate(
      conversationMutators.updateSession({conversationToken: 'latest-token'})
    );

    const retryResult = await runtime.retryTurn(firstTurn.id);
    expect(retryResult.accepted).toBe(true);

    expect(observedTokens).toEqual(['old-token', 'old-token']);

    const turns = fullEngine.read(conversationSelectors.turns);
    expect(turns).toHaveLength(2);
    expect(turns[1].status).toBe('failed');
  });

  it('does not fallback to latest token on non-token protocol failures', async () => {
    const observedTokens: Array<string | undefined> = [];

    const runtime = createRuntime(
      createScriptedTransport((request) => {
        const token =
          typeof request.body === 'object' && request.body
            ? (request.body as {conversationToken?: string}).conversationToken
            : undefined;

        observedTokens.push(token);

        if (token === 'old-token') {
          emitEvent(request, {
            type: 'RUN_ERROR',
            code: 'MODEL_FAIL',
            message: 'model unavailable',
          });
          request.onClose();
          return;
        }

        emitEvent(request, {
          type: 'RUN_FINISHED',
          threadId: 'thread-1',
          runId: 'run-1',
        });
        request.onClose();
      })
    );

    const fullEngine = getFullEngine(engine);
    fullEngine.mutate(
      conversationMutators.updateSession({
        sessionId: 'session-1',
        conversationToken: 'old-token',
      })
    );

    await runtime.submitTurn('hello');

    const firstTurn = fullEngine.read(conversationSelectors.turns)[0];
    expect(firstTurn).toBeDefined();
    expect(firstTurn.status).toBe('failed');

    fullEngine.mutate(
      conversationMutators.updateSession({conversationToken: 'latest-token'})
    );

    const retryResult = await runtime.retryTurn(firstTurn.id);
    expect(retryResult.accepted).toBe(true);

    expect(observedTokens).toEqual(['old-token', 'old-token']);

    const turns = fullEngine.read(conversationSelectors.turns);
    expect(turns).toHaveLength(2);
    expect(turns[1].status).toBe('failed');
  });
});
