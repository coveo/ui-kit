import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestEngine, nextTick} from '@/src/test/test-utils.js';
import type {Engine} from '@/src/core/interface/engine/engine.js';
import {createSubmitTurnOperation} from './submit-turn-operation.js';
import {defaultConversationIdStrategy} from './id-strategy.js';
import {conversationSlice} from '@/src/core/internal/conversation/slice.js';
import {streamingSlice} from '@/src/core/internal/streaming/slice.js';
import {surfacesSlice} from '@/src/core/internal/surfaces/slice.js';
import {getFullEngine} from '@/src/core/interface/engine/engine.js';
import type {
  TransportAdapter,
  StreamRequest,
} from '@/src/api/adapters/types.js';
import * as conversationSelectors from '@/src/core/interface/conversation/selectors.js';

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

describe('createSubmitTurnOperation', () => {
  let engine: Engine;
  let fullEngine: any;
  let saveCheckpoint: ReturnType<typeof vi.fn>;
  let hooks: {
    turn_initialized?: ReturnType<typeof vi.fn>;
    stream_opened?: ReturnType<typeof vi.fn>;
    stream_closed?: ReturnType<typeof vi.fn>;
    turn_finalized?: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    fullEngine.adoptSlice(conversationSlice);
    fullEngine.adoptSlice(streamingSlice);
    fullEngine.adoptSlice(surfacesSlice);

    saveCheckpoint = vi.fn(async () => undefined);
    hooks = {
      turn_initialized: vi.fn(),
      stream_opened: vi.fn(),
      stream_closed: vi.fn(),
      turn_finalized: vi.fn(),
    };
  });

  it('rejects submitTurn when a turn is already active', async () => {
    const operation = createSubmitTurnOperation({
      fullEngine,
      transport: createScriptedTransport(() => {
        // Keep stream open, don't close
      }),
      idStrategy: defaultConversationIdStrategy,
      saveCheckpoint,
      hooks,
    });

    // Start first submit (but keep stream open)
    const firstSubmit = operation.submitTurn('first turn');

    // Immediately try to submit while first is still active
    await operation.submitTurn('second turn');

    // Should have set error
    const state = fullEngine.read((state: any) => state);
    expect(state.conversation?.error).toBe('A turn is already in progress');
    expect(state.conversation?.structuredError?.code).toBe(
      'ACTIVE_TURN_IN_PROGRESS'
    );

    // Cleanup
    const abort = operation.getAbortController();
    if (abort) {
      abort.abort();
    }
    await firstSubmit;
  });

  it('calls hooks in correct order during successful submit', async () => {
    const operation = createSubmitTurnOperation({
      fullEngine,
      transport: createScriptedTransport((request) => {
        emitEvent(request, {
          type: 'RUN_FINISHED',
          threadId: 'thread-1',
          runId: 'run-1',
        });
        request.onClose();
      }),
      idStrategy: defaultConversationIdStrategy,
      saveCheckpoint,
      hooks,
    });

    await operation.submitTurn('hello');

    expect(hooks.turn_initialized).toHaveBeenCalledOnce();
    expect(hooks.stream_opened).toHaveBeenCalledOnce();
    expect(hooks.stream_closed).toHaveBeenCalledOnce();
    expect(hooks.turn_finalized).toHaveBeenCalledOnce();
  });

  it('saves checkpoint before and after stream execution', async () => {
    const operation = createSubmitTurnOperation({
      fullEngine,
      transport: createScriptedTransport((request) => {
        emitEvent(request, {
          type: 'RUN_FINISHED',
          threadId: 'thread-1',
          runId: 'run-1',
        });
        request.onClose();
      }),
      idStrategy: defaultConversationIdStrategy,
      saveCheckpoint,
      hooks,
    });

    await operation.submitTurn('hello');

    expect(saveCheckpoint).toHaveBeenCalledTimes(2);
  });

  it('getAbortController returns null after stream completes', async () => {
    const operation = createSubmitTurnOperation({
      fullEngine,
      transport: createScriptedTransport((request) => {
        emitEvent(request, {
          type: 'RUN_FINISHED',
          threadId: 'thread-1',
          runId: 'run-1',
        });
        request.onClose();
      }),
      idStrategy: defaultConversationIdStrategy,
      saveCheckpoint,
      hooks,
    });

    await operation.submitTurn('hello');

    expect(operation.getAbortController()).toBeNull();
  });

  it('handles transport errors during stream', async () => {
    const operation = createSubmitTurnOperation({
      fullEngine,
      transport: createScriptedTransport(() => {
        throw new Error('Transport failed');
      }),
      idStrategy: defaultConversationIdStrategy,
      saveCheckpoint,
      hooks,
    });

    await operation.submitTurn('hello');

    const turns = fullEngine.read(conversationSelectors.turns);
    expect(turns).toHaveLength(1);
    expect(turns[0].status).toBe('failed');
  });
});
