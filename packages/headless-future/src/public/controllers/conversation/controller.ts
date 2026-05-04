/**
 * Layer 2: ConversationController
 *
 * Owns turn lifecycle as a user-domain workflow:
 *  - start turn, append user message, mark active turn, finalize turn
 *  - conversation history: ordering, retry lineage, visibility, metadata
 *  - session continuity fields from backend responses
 *
 * Non-responsibilities: transport wiring, SSE parsing, surface reduction,
 * orchestration policy. Those concerns live in dedicated controllers/adapters.
 */

import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {conversationSlice} from '@/src/core/internal/conversation/slice.js';
import * as conversationSelectors from '@/src/core/interface/conversation/selectors.js';
import * as conversationMutators from '@/src/core/interface/conversation/mutate.js';
import * as streamingMutators from '@/src/core/interface/streaming/mutate.js';
import * as surfacesMutators from '@/src/core/interface/surfaces/mutate.js';
import {streamingSlice} from '@/src/core/internal/streaming/slice.js';
import {surfacesSlice} from '@/src/core/internal/surfaces/slice.js';
import {createBufferProcessor} from '@/src/api/protocol/buffer.js';
import {parseSSEEvent} from '@/src/api/protocol/sse-parser.js';
import type {NormalizedStreamEvent} from '@/src/api/protocol/types.js';
import type {UnifiedAdapters} from '@/src/api/adapters/types.js';
import {CONVERSATION_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import type {
  ConversationMessage,
  ConversationState,
  ConversationSession,
} from '@/src/core/interface/conversation/types.js';
import {createSelector} from '@reduxjs/toolkit';
import * as conversationStateSelectors from '@/src/core/interface/conversation/selectors.js';

let idCounter = 0;
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

const stateSelect = createSelector(
  [
    conversationSelectors.messages,
    conversationSelectors.activeTurn,
    conversationSelectors.session,
    conversationSelectors.isLoading,
    conversationSelectors.error,
  ],
  (messages, activeTurn, session, isLoading, error) => ({
    messages,
    activeTurn,
    session,
    isLoading,
    error,
  })
);

export const buildConversationController = (
  engine: Engine,
  adapters: Pick<UnifiedAdapters, 'transport' | 'auth' | 'persistence'>
) => {
  const fullEngine = getFullEngine(engine);

  fullEngine.adoptSlice(conversationSlice);
  fullEngine.adoptSlice(streamingSlice);
  fullEngine.adoptSlice(surfacesSlice);

  const selectConversationState = (state: {conversation?: ConversationState}) =>
    state.conversation;

  const persistConversationState = async (state: ConversationState) => {
    await adapters.persistence.save(CONVERSATION_PERSISTENCE_KEY, state);
  };

  void (async () => {
    const persisted = await adapters.persistence.load(
      CONVERSATION_PERSISTENCE_KEY
    );
    if (persisted && typeof persisted === 'object') {
      fullEngine.mutate(
        conversationMutators.rehydrateConversation(
          persisted as ConversationState
        )
      );
    }

    engine.subscribe(selectConversationState, (state) => {
      if (!state) {
        return;
      }
      void persistConversationState(state);
    });
  })();

  // Track the active AbortController outside state (non-serializable)
  let activeAbortController: AbortController | null = null;

  /**
   * Handle a normalized stream event and apply the corresponding state mutations.
   */
  const applyEvent = (
    event: NormalizedStreamEvent,
    assistantMessageId: string
  ) => {
    fullEngine.mutate(streamingMutators.recordEvent(Date.now()));

    switch (event.type) {
      case 'turn_started': {
        const updates: Partial<ConversationSession> = {};
        if (event.conversationSessionId) {
          updates.sessionId = event.conversationSessionId;
        }
        if (event.conversationToken) {
          updates.conversationToken = event.conversationToken;
        }
        if (Object.keys(updates).length > 0) {
          fullEngine.mutate(conversationMutators.updateSession(updates));
        }
        break;
      }
      case 'TEXT_MESSAGE_START': {
        // Ensure assistant message exists for accumulation
        break;
      }
      case 'TEXT_MESSAGE_CONTENT': {
        if (event.messageId === assistantMessageId) {
          fullEngine.mutate(
            conversationMutators.appendMessageContent(
              assistantMessageId,
              event.delta
            )
          );
        }
        break;
      }
      case 'RUN_FINISHED':
      case 'turn_complete': {
        // Finalization handled in onClose / after stream
        break;
      }
      case 'RUN_ERROR': {
        fullEngine.mutate(
          conversationMutators.setError(event.message ?? 'Stream error')
        );
        break;
      }
      default:
        break;
    }
  };

  return {
    /**
     * Submit a new user turn. Creates user + assistant messages, opens the
     * converse stream, and processes events until the turn is finalized.
     */
    async submitTurn(
      input: string,
      options?: {metadata?: Record<string, unknown>}
    ): Promise<void> {
      const turnId = generateId('turn');
      const userMessageId = generateId('msg');
      const assistantMessageId = generateId('msg');
      const now = Date.now();

      const userMessage: ConversationMessage = {
        id: userMessageId,
        role: 'user',
        content: input,
        createdAt: now,
        metadata: {turnId, ...options?.metadata},
      };

      const assistantMessage: ConversationMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: now,
        metadata: {turnId},
      };

      // Register messages and turn in state
      fullEngine.mutate(conversationMutators.addMessage(userMessage));
      fullEngine.mutate(conversationMutators.addMessage(assistantMessage));
      fullEngine.mutate(
        conversationMutators.addTurn({
          id: turnId,
          userMessageId,
          assistantMessageId,
          status: 'pending',
          createdAt: now,
        })
      );
      fullEngine.mutate(conversationMutators.setActiveTurnId(turnId));
      fullEngine.mutate(conversationMutators.setLoading(true));
      fullEngine.mutate(conversationMutators.setError(null));
      fullEngine.mutate(streamingMutators.resetStream());

      activeAbortController = new AbortController();

      try {
        const session = engine.read(conversationStateSelectors.session);
        const messages = engine.read(conversationStateSelectors.messages);

        fullEngine.mutate(
          conversationMutators.updateTurnStatus(turnId, 'streaming')
        );
        fullEngine.mutate(streamingMutators.setConnected(true));

        const decoder = new TextDecoder();
        const bufferProcessor = createBufferProcessor((rawEvent) => {
          const normalized = parseSSEEvent(rawEvent);
          applyEvent(normalized, assistantMessageId);
        });

        await adapters.transport.openStream({
          path: '/rest/organizations/{organizationId}/ai/v1/converse',
          body: {
            query: input,
            sessionId: session?.sessionId || undefined,
            conversationToken: session?.conversationToken || undefined,
            messages: messages
              .filter((m) => m.role !== 'system')
              .map((m) => ({role: m.role, content: m.content})),
          },
          signal: activeAbortController.signal,
          onChunk: (chunk) => {
            const text = decoder.decode(chunk, {stream: true});
            fullEngine.mutate(streamingMutators.addBytes(chunk.byteLength));
            bufferProcessor.processChunk(text);
          },
          onError: (error) => {
            fullEngine.mutate(streamingMutators.setStreamError(error));
            fullEngine.mutate(
              conversationMutators.updateTurnStatus(turnId, 'failed', {
                finalizedAt: Date.now(),
                reason: error.message,
              })
            );
            fullEngine.mutate(conversationMutators.setActiveTurnId(null));
            fullEngine.mutate(conversationMutators.setLoading(false));
          },
          onClose: () => {
            bufferProcessor.flush();
            fullEngine.mutate(streamingMutators.setConnected(false));
            fullEngine.mutate(
              conversationMutators.updateTurnStatus(turnId, 'completed', {
                finalizedAt: Date.now(),
                assistantMessageId,
              })
            );
            fullEngine.mutate(conversationMutators.setActiveTurnId(null));
            fullEngine.mutate(conversationMutators.setLoading(false));
          },
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unknown error during submitTurn';
        fullEngine.mutate(conversationMutators.setError(message));
        fullEngine.mutate(
          conversationMutators.updateTurnStatus(turnId, 'failed', {
            finalizedAt: Date.now(),
            reason: message,
          })
        );
        fullEngine.mutate(conversationMutators.setActiveTurnId(null));
        fullEngine.mutate(conversationMutators.setLoading(false));
        fullEngine.mutate(streamingMutators.setConnected(false));
      } finally {
        activeAbortController = null;
      }
    },

    /**
     * Abort the in-flight turn.
     */
    abortTurn(reason?: string): void {
      if (activeAbortController) {
        activeAbortController.abort(reason);
        activeAbortController = null;
      }
      const turnId = engine.read(conversationSelectors.activeTurnId);
      if (turnId) {
        fullEngine.mutate(
          conversationMutators.updateTurnStatus(turnId, 'aborted', {
            finalizedAt: Date.now(),
            reason: reason ?? 'user-abort',
          })
        );
        fullEngine.mutate(conversationMutators.setActiveTurnId(null));
      }
      fullEngine.mutate(streamingMutators.setAborted(true));
      fullEngine.mutate(conversationMutators.setLoading(false));
    },

    /**
     * Retry a previously failed or aborted turn by its turn ID.
     */
    async retryTurn(turnId: string): Promise<void> {
      const turns = engine.read(conversationSelectors.turns);
      const messages = engine.read(conversationSelectors.messages);
      const turn = turns.find((t) => t.id === turnId);
      if (!turn) return;

      const userMessage = messages.find((m) => m.id === turn.userMessageId);
      if (!userMessage) return;

      await this.submitTurn(userMessage.content, {
        metadata: {retryOf: turnId},
      });
    },

    /**
     * Clear all conversation history and reset session state.
     */
    clearConversation(): void {
      this.abortTurn('clear');
      fullEngine.mutate(conversationMutators.clearConversation());
      fullEngine.mutate(streamingMutators.resetStream());
      fullEngine.mutate(surfacesMutators.clearAllSurfaces());
      void adapters.persistence.delete(CONVERSATION_PERSISTENCE_KEY);
    },

    get state() {
      return engine.read(stateSelect);
    },

    subscribe(callback: () => void) {
      return engine.subscribe(stateSelect, callback);
    },
  };
};

export type ConversationController = ReturnType<
  typeof buildConversationController
>;
