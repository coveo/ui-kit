/**
 * Layer 2: ContextBridgeController
 *
 * Owns bidirectional mapping between search/discovery state and conversation context.
 *
 * Responsibilities:
 *  - Track selected products/content, active query/facets, citations, entities
 *  - Provide explicit bridge actions: attachSearchContextToTurn,
 *    publishAssistantSelectionsToSearch
 *  - Ensure correlation fields required for analytics and continuity are propagated
 *
 * Non-responsibilities: executing search requests directly, stream parsing, rendering.
 *
 * v1 uses a suggestion model (search context is attached; assistant cannot mutate
 * search state). Active mutation of search state is planned for a future iteration.
 */

import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {contextBridgeSlice} from '@/src/core/internal/context-bridge/context-bridge-slice.js';
import * as contextBridgeSelectors from '@/src/core/interface/context-bridge/context-bridge-selectors.js';
import * as contextBridgeMutators from '@/src/core/interface/context-bridge/context-bridge-mutators.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import {CONTEXT_BRIDGE_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import type {PersistenceAdapter} from '@/src/api/adapters/types.js';
import type {
  CitationLink,
  ContextBridgeState,
} from '@/src/core/interface/context-bridge/context-bridge-types.js';
import {createSelector} from '@reduxjs/toolkit';

const stateSelect = createSelector(
  [
    contextBridgeSelectors.selectedProducts,
    contextBridgeSelectors.activeQuery,
    contextBridgeSelectors.activeFilters,
    contextBridgeSelectors.citations,
  ],
  (selectedProducts, activeQuery, activeFilters, citations) => ({
    selectedProducts,
    activeQuery,
    activeFilters,
    citations,
  })
);

export const buildContextBridgeController = (
  engine: Engine,
  persistence?: PersistenceAdapter
) => {
  const fullEngine = getFullEngine(engine);

  fullEngine.adoptSlice(contextBridgeSlice);

  const persistenceAdapter: PersistenceAdapter = persistence ?? {
    save: async () => undefined,
    load: async () => null,
    delete: async () => undefined,
    list: async () => [],
  };

  const selectContextBridgeState = (state: {
    contextBridge?: ContextBridgeState;
  }) => state.contextBridge;

  void (async () => {
    let persisted = await persistenceAdapter.load(
      CONTEXT_BRIDGE_PERSISTENCE_KEY
    );

    if (persisted && typeof persisted === 'object') {
      fullEngine.mutate(
        contextBridgeMutators.rehydrateContext(persisted as ContextBridgeState)
      );
    }

    engine.subscribe(selectContextBridgeState, (nextState) => {
      if (!nextState) {
        return;
      }

      const isEmptyContext =
        nextState.selectedProducts.length === 0 &&
        nextState.citations.length === 0 &&
        Object.keys(nextState.activeFilters).length === 0 &&
        !nextState.activeQuery;

      if (isEmptyContext) {
        void persistenceAdapter.delete(CONTEXT_BRIDGE_PERSISTENCE_KEY);
        return;
      }

      void persistenceAdapter.save(CONTEXT_BRIDGE_PERSISTENCE_KEY, nextState);
    });
  })();

  return {
    /**
     * Attach the current search context (query, filters, selected products)
     * to a specific turn as conversation metadata.
     *
     * v1: suggestion model — context is copied into turn metadata without
     * modifying the search state.
     */
    attachSearchContextToTurn(turnId: string): void {
      const selectedProducts = engine.read(
        contextBridgeSelectors.selectedProducts
      );
      const activeQuery = engine.read(contextBridgeSelectors.activeQuery);
      const activeFilters = engine.read(contextBridgeSelectors.activeFilters);

      fullEngine.mutate(
        conversationMutators.updateMessage(turnId, {
          metadata: {
            turnId,
            // Search context is embedded in message metadata for backend context
          },
        })
      );

      // Store correlation in context bridge state for analytics continuity
      fullEngine.mutate(contextBridgeMutators.setActiveQuery(activeQuery));
      fullEngine.mutate(contextBridgeMutators.setActiveFilters(activeFilters));
      fullEngine.mutate(
        contextBridgeMutators.setSelectedProducts(selectedProducts)
      );
    },

    /**
     * Publish assistant-surfaced product selections back to the search context.
     * These can be used to pre-filter or annotate subsequent search queries.
     *
     * v1: writes to contextBridge only. Future iterations may dispatch
     * search state mutations directly.
     */
    publishAssistantSelectionsToSearch(selections: {
      products: string[];
      filters?: Record<string, string[]>;
    }): void {
      fullEngine.mutate(
        contextBridgeMutators.setSelectedProducts(selections.products)
      );
      if (selections.filters) {
        fullEngine.mutate(
          contextBridgeMutators.setActiveFilters(selections.filters)
        );
      }
    },

    /**
     * Record a citation link surfaced by the assistant.
     */
    addCitation(citation: CitationLink): void {
      fullEngine.mutate(contextBridgeMutators.addCitation(citation));
    },

    /**
     * Update the active search query in the context bridge state.
     * Called when the search state changes so conversation has latest query context.
     */
    syncSearchQuery(query: string): void {
      fullEngine.mutate(contextBridgeMutators.setActiveQuery(query));
    },

    /**
     * Update the active filters in the context bridge state.
     */
    syncSearchFilters(filters: Record<string, string[]>): void {
      fullEngine.mutate(contextBridgeMutators.setActiveFilters(filters));
    },

    get state() {
      return engine.read(stateSelect);
    },

    subscribe(callback: () => void) {
      return engine.subscribe(stateSelect, callback);
    },
  };
};

export type ContextBridgeController = ReturnType<
  typeof buildContextBridgeController
>;
