/**
 * Layer 2: ConversationController
 *
 * Thin facade over API runtime operations.
 */

import {createSelector} from '@reduxjs/toolkit';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationSelectors from '@/src/core/interface/conversation/conversation-selectors.js';
import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import {surfacesSlice} from '@/src/core/internal/surfaces/surfaces-slice.js';
import type {UnifiedAdapters} from '@/src/api/adapters/types.js';
import {
  defaultConversationIdStrategy,
  type ConversationIdStrategy,
} from '@/src/api/conversation/id-strategy.js';
import {
  getConversationRuntime,
  type ConversationLifecycleHooks,
} from '@/src/api/conversation/runtime.js';

const stateSelect = createSelector(
  [
    conversationSelectors.messages,
    conversationSelectors.turns,
    conversationSelectors.activeTurnId,
    conversationSelectors.session,
    conversationSelectors.isLoading,
    conversationSelectors.error,
    conversationSelectors.structuredError,
    conversationSelectors.streaming,
  ],
  (
    messages,
    turns,
    activeTurnId,
    session,
    isLoading,
    error,
    structuredError,
    streaming
  ) => ({
    messages,
    turns,
    activeTurnId,
    session,
    isLoading,
    error,
    structuredError,
    streaming,
  })
);

type BuildConversationControllerOptions = {
  hooks?: ConversationLifecycleHooks;
  idStrategy?: ConversationIdStrategy;
};

export const buildConversationController = (
  engine: Engine,
  adapters: Pick<UnifiedAdapters, 'transport' | 'auth' | 'persistence'>,
  options?: BuildConversationControllerOptions
) => {
  const fullEngine = getFullEngine(engine);
  const hooks = options?.hooks;
  const idStrategy = options?.idStrategy ?? defaultConversationIdStrategy;

  fullEngine.adoptSlice(conversationSlice);
  fullEngine.adoptSlice(surfacesSlice);

  const runtime = getConversationRuntime(engine, {
    transport: adapters.transport,
    persistence: adapters.persistence,
    idStrategy,
    hooks,
  });

  return {
    submitTurn: (
      input: string,
      options?: {metadata?: Record<string, unknown>}
    ) => runtime.submitTurn(input, options),

    abortTurn: (reason?: string) => runtime.abortActiveTurn(reason),

    retryTurn: (turnId: string) => runtime.retryTurn(turnId),

    clearConversation: () => runtime.clearConversation(),

    get state() {
      return fullEngine.read(stateSelect);
    },

    subscribe(callback: () => void) {
      return fullEngine.subscribe(stateSelect, callback);
    },
  };
};

export type ConversationController = ReturnType<
  typeof buildConversationController
>;
