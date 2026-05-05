import type {
  PersistenceAdapter,
  TransportAdapter,
} from '@/src/api/adapters/types.js';
import {CONVERSATION_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import {
  Engine,
  type FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import * as conversationSelectors from '@/src/core/interface/conversation/conversation-selectors.js';
import * as surfacesMutators from '@/src/core/interface/surfaces/surfaces-mutators.js';
import {executeConverseStream} from './execute-converse-stream.js';
import {dispatchStreamEvent} from './event-dispatcher.js';
import {finalizeFromStreamOutcome} from './stream-outcome-finalizer.js';
import {
  finalizeTurnAborted,
  finalizeTurnFailed,
  markTurnStreaming,
} from './turn-finalizer.js';
import {
  buildConverseRequestBody,
  initializeTurn,
  type ConverseRequestBody,
} from './turn-orchestrator.js';
import {
  loadConversationCheckpoints,
  saveConversationCheckpoint,
} from './persistence-checkpoints.js';
import type {ConversationIdStrategy} from './id-strategy.js';

export type ConversationLifecycleHooks = {
  turn_initialized?: (turnId: string) => void;
  stream_opened?: (turnId: string) => void;
  stream_closed?: (turnId: string) => void;
  turn_finalized?: (turnId: string) => void;
};

type SubmitTurnRejectedReason = 'ACTIVE_TURN_IN_PROGRESS';

export type SubmitTurnResult =
  | {
      accepted: true;
      turnId: string;
    }
  | {
      accepted: false;
      reason: SubmitTurnRejectedReason;
    };

type RetryTurnRejectedReason =
  | SubmitTurnRejectedReason
  | 'TURN_NOT_FOUND'
  | 'TURN_USER_MESSAGE_NOT_FOUND';

export type RetryTurnResult =
  | {
      accepted: true;
      turnId: string;
    }
  | {
      accepted: false;
      reason: RetryTurnRejectedReason;
    };

type RuntimeParams = {
  transport: TransportAdapter;
  persistence: PersistenceAdapter;
  idStrategy: ConversationIdStrategy;
  hooks?: ConversationLifecycleHooks;
};

type TurnSnapshot = {
  input: string;
  metadata?: Record<string, unknown>;
  body: ConverseRequestBody;
};

type InternalSubmitOptions = {
  metadata?: Record<string, unknown>;
  requestBodyOverride?: ConverseRequestBody;
  fallbackConversationToken?: string;
};

export type ConversationRuntime = {
  submitTurn: (
    input: string,
    options?: {metadata?: Record<string, unknown>}
  ) => Promise<SubmitTurnResult>;
  abortActiveTurn: (reason?: string) => void;
  retryTurn: (turnId: string) => Promise<RetryTurnResult>;
  clearConversation: () => void;
  registerHooks: (hooks?: ConversationLifecycleHooks) => void;
};

const runtimeByEngine = new WeakMap<Engine, ConversationRuntime>();

const hookNames: Array<keyof ConversationLifecycleHooks> = [
  'turn_initialized',
  'stream_opened',
  'stream_closed',
  'turn_finalized',
];

const tokenFailurePattern =
  /(token|auth|unauthoriz|forbidden|credential|jwt|expired|invalid[_\s-]?token)/i;

const isTokenFailureSignal = (value?: string): boolean => {
  if (!value) {
    return false;
  }

  return tokenFailurePattern.test(value);
};

const shouldRetryWithFallbackToken = (
  outcome: Awaited<ReturnType<typeof executeConverseStream>>,
  currentConversationToken: string | undefined,
  fallbackConversationToken: string | undefined
): boolean => {
  if (
    !fallbackConversationToken ||
    fallbackConversationToken === currentConversationToken
  ) {
    return false;
  }

  if (outcome.kind !== 'transport_error' && outcome.kind !== 'protocol_error') {
    return false;
  }

  return (
    isTokenFailureSignal(outcome.code) || isTokenFailureSignal(outcome.message)
  );
};

export const getConversationRuntime = (
  engine: Engine,
  params: RuntimeParams
): ConversationRuntime => {
  const existingRuntime = runtimeByEngine.get(engine);
  if (existingRuntime) {
    existingRuntime.registerHooks(params.hooks);
    return existingRuntime;
  }

  const runtime = createConversationRuntime(getFullEngine(engine), params);
  runtimeByEngine.set(engine, runtime);
  return runtime;
};

const createConversationRuntime = (
  fullEngine: FullEngine,
  params: RuntimeParams
): ConversationRuntime => {
  const hookSet = new Set<ConversationLifecycleHooks>();
  const snapshotsByTurnId = new Map<string, TurnSnapshot>();
  let activeAbortController: AbortController | null = null;

  const invokeHook = (
    hookName: keyof ConversationLifecycleHooks,
    turnId: string
  ) => {
    for (const hooks of hookSet) {
      const callback = hooks[hookName];
      if (!callback) {
        continue;
      }

      try {
        callback(turnId);
      } catch {
        // Ignore hook failures so lifecycle callbacks cannot break turn orchestration.
      }
    }
  };

  const setPersistenceStructuredError = (message: string, turnId?: string) => {
    fullEngine.mutate(
      conversationMutators.setStructuredError({
        code: 'PERSISTENCE_SAVE_ERROR',
        message,
        source: 'persistence',
        recoverable: true,
        timestamp: Date.now(),
        turnId,
      })
    );
  };

  const recordLoadError = (error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to load persisted conversation state';
    fullEngine.mutate(conversationMutators.setError(message));
    fullEngine.mutate(
      conversationMutators.setStructuredError({
        code: 'PERSISTENCE_LOAD_ERROR',
        message,
        source: 'persistence',
        recoverable: true,
        timestamp: Date.now(),
      })
    );
  };

  const saveCheckpoint = async (turnId?: string): Promise<void> => {
    try {
      await saveConversationCheckpoint(fullEngine, params.persistence);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to save conversation checkpoint';
      setPersistenceStructuredError(message, turnId);
    }
  };

  const checkpointsReady = loadConversationCheckpoints(
    fullEngine,
    params.persistence
  ).catch(recordLoadError);

  const shouldAcceptStreamUpdates = (turnId: string): boolean => {
    if (fullEngine.read(conversationSelectors.activeTurnId) !== turnId) {
      return false;
    }

    const turn = fullEngine
      .read(conversationSelectors.turns)
      .find((existingTurn) => existingTurn.id === turnId);

    return turn?.status === 'streaming';
  };

  const registerHooks = (hooks?: ConversationLifecycleHooks) => {
    if (!hooks) {
      return;
    }

    if (hookNames.some((name) => hooks[name])) {
      hookSet.add(hooks);
    }
  };

  const finalizeTurnAfterStream = async (
    turnId: string,
    assistantMessageId: string,
    outcome: Awaited<ReturnType<typeof executeConverseStream>>,
    streamClosed: boolean
  ) => {
    if (streamClosed) {
      invokeHook('stream_closed', turnId);
    }

    const finalized = finalizeFromStreamOutcome(fullEngine, outcome, {
      turnId,
      assistantMessageId,
    });

    if (finalized) {
      invokeHook('turn_finalized', turnId);
      await saveCheckpoint(turnId);
    }
  };

  const runStream = async (
    turnId: string,
    assistantMessageId: string,
    body: ConverseRequestBody,
    fallbackConversationToken?: string
  ) => {
    const runAttempt = async (requestBody: ConverseRequestBody) => {
      let streamClosed = false;

      const outcome = await executeConverseStream({
        transport: params.transport,
        body: requestBody,
        signal: activeAbortController?.signal,
        callbacks: {
          onNormalizedEvent: (event) => {
            if (!shouldAcceptStreamUpdates(turnId)) {
              return;
            }
            dispatchStreamEvent(fullEngine, event, turnId, assistantMessageId);
          },
          onBytesReceived: (bytes) => {
            if (!shouldAcceptStreamUpdates(turnId)) {
              return;
            }
            fullEngine.mutate(conversationMutators.addStreamingBytes(bytes));
          },
          onLifecycle: (event) => {
            if (event.type === 'closed') {
              streamClosed = true;
            }
          },
        },
      });

      return {outcome, streamClosed};
    };

    const firstAttempt = await runAttempt(body);
    let outcome = firstAttempt.outcome;
    let streamClosed = firstAttempt.streamClosed;

    if (
      shouldRetryWithFallbackToken(
        outcome,
        body.conversationToken,
        fallbackConversationToken
      )
    ) {
      fullEngine.mutate(conversationMutators.setError(null));
      fullEngine.mutate(conversationMutators.setStructuredError(null));

      const secondAttempt = await runAttempt({
        ...body,
        conversationToken: fallbackConversationToken,
      });

      outcome = secondAttempt.outcome;
      streamClosed = streamClosed || secondAttempt.streamClosed;
    }

    await finalizeTurnAfterStream(
      turnId,
      assistantMessageId,
      outcome,
      streamClosed
    );
  };

  const submitTurnInternal = async (
    input: string,
    options?: InternalSubmitOptions
  ): Promise<SubmitTurnResult> => {
    await checkpointsReady;

    const activeTurnId = fullEngine.read(conversationSelectors.activeTurnId);
    if (activeTurnId) {
      const message = 'A turn is already in progress';
      fullEngine.mutate(conversationMutators.setError(message));
      fullEngine.mutate(
        conversationMutators.setStructuredError({
          code: 'ACTIVE_TURN_IN_PROGRESS',
          message,
          source: 'controller',
          recoverable: true,
          timestamp: Date.now(),
          turnId: activeTurnId,
        })
      );

      return {
        accepted: false,
        reason: 'ACTIVE_TURN_IN_PROGRESS',
      };
    }

    const turn = initializeTurn(
      fullEngine,
      input,
      params.idStrategy,
      options?.metadata
    );
    invokeHook('turn_initialized', turn.turnId);

    const defaultBody = buildConverseRequestBody(fullEngine, input);
    snapshotsByTurnId.set(turn.turnId, {
      input,
      metadata: options?.metadata,
      body: defaultBody,
    });

    await saveCheckpoint(turn.turnId);

    activeAbortController = new AbortController();

    markTurnStreaming(fullEngine, turn.turnId);
    fullEngine.mutate(conversationMutators.setStreamingConnected(true));
    invokeHook('stream_opened', turn.turnId);

    try {
      await runStream(
        turn.turnId,
        turn.assistantMessageId,
        options?.requestBodyOverride ?? defaultBody,
        options?.fallbackConversationToken
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error during submitTurn';

      const currentTurn = fullEngine
        .read(conversationSelectors.turns)
        .find((existingTurn) => existingTurn.id === turn.turnId);

      if (currentTurn?.status !== 'aborted') {
        finalizeTurnFailed(fullEngine, turn.turnId, {
          code: 'SUBMIT_TURN_ERROR',
          message,
          source: 'controller',
          recoverable: true,
        });
        invokeHook('turn_finalized', turn.turnId);
        await saveCheckpoint(turn.turnId);
      }
    } finally {
      activeAbortController = null;
    }

    return {
      accepted: true,
      turnId: turn.turnId,
    };
  };

  const abortActiveTurn = (reason?: string, saveAfterAbort = true): void => {
    if (activeAbortController) {
      activeAbortController.abort(reason);
    }

    const turnId = fullEngine.read(conversationSelectors.activeTurnId);
    if (turnId) {
      const finalized = finalizeTurnAborted(
        fullEngine,
        turnId,
        reason ?? 'user-abort'
      );
      if (finalized) {
        invokeHook('turn_finalized', turnId);
        if (saveAfterAbort) {
          void saveCheckpoint(turnId);
        }
      }
    }

    fullEngine.mutate(conversationMutators.setStreamingConnected(false));
  };

  const retryTurn = async (turnId: string): Promise<RetryTurnResult> => {
    await checkpointsReady;

    const turns = fullEngine.read(conversationSelectors.turns);
    const turn = turns.find((existingTurn) => existingTurn.id === turnId);
    if (!turn) {
      return {
        accepted: false,
        reason: 'TURN_NOT_FOUND',
      };
    }

    const messages = fullEngine.read(conversationSelectors.messages);
    const userMessage = messages.find(
      (message) => message.id === turn.userMessageId
    );
    if (!userMessage) {
      return {
        accepted: false,
        reason: 'TURN_USER_MESSAGE_NOT_FOUND',
      };
    }

    const snapshot = snapshotsByTurnId.get(turnId);
    if (!snapshot) {
      return submitTurnInternal(userMessage.content, {
        metadata: {retryOf: turnId},
      });
    }

    const latestToken = fullEngine.read(
      conversationSelectors.session
    ).conversationToken;

    return submitTurnInternal(snapshot.input, {
      metadata: {
        ...(snapshot.metadata ?? {}),
        retryOf: turnId,
      },
      requestBodyOverride: snapshot.body,
      fallbackConversationToken: latestToken || undefined,
    });
  };

  const clearConversation = (): void => {
    abortActiveTurn('clear', false);
    fullEngine.mutate(conversationMutators.clearConversation());
    fullEngine.mutate(surfacesMutators.clearAllSurfaces());
    snapshotsByTurnId.clear();
    void params.persistence.delete(CONVERSATION_PERSISTENCE_KEY);
  };

  registerHooks(params.hooks);

  return {
    submitTurn: (input, options) => submitTurnInternal(input, options),
    abortActiveTurn: (reason) => abortActiveTurn(reason, true),
    retryTurn,
    clearConversation,
    registerHooks,
  };
};
