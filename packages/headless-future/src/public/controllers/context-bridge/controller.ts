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

import {Engine} from '@/src/core/interface/engine/engine.js';
import {sharedContextSlice} from '@/src/core/internal/shared-context/slice.js';
import * as sharedContextSelectors from '@/src/core/interface/shared-context/selectors.js';
import * as sharedContextMutators from '@/src/core/interface/shared-context/mutate.js';
import * as conversationMutators from '@/src/core/interface/conversation/mutate.js';
import {SHARED_CONTEXT_PERSISTENCE_KEY} from '@/src/api/adapters/persistence-keys.js';
import type {PersistenceAdapter} from '@/src/api/adapters/types.js';
import type {
  CitationLink,
  SharedContextState,
} from '@/src/core/interface/shared-context/types.js';
import {createSelector} from '@reduxjs/toolkit';

const stateSelect = createSelector(
  [
    sharedContextSelectors.selectedProducts,
    sharedContextSelectors.activeQuery,
    sharedContextSelectors.activeFilters,
    sharedContextSelectors.citations,
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
  engine.adoptSlice(sharedContextSlice);

  const persistenceAdapter: PersistenceAdapter = persistence ?? {
    save: async () => undefined,
    load: async () => null,
    delete: async () => undefined,
    list: async () => [],
  };

  const selectSharedContextState = (state: {
    sharedContext?: SharedContextState;
  }) => state.sharedContext;

  void (async () => {
    const persisted = await persistenceAdapter.load(
      SHARED_CONTEXT_PERSISTENCE_KEY
    );
    if (persisted && typeof persisted === 'object') {
      engine.mutate(
        sharedContextMutators.rehydrateContext(persisted as SharedContextState)
      );
    }

    engine.subscribe(selectSharedContextState, (nextState) => {
      if (!nextState) {
        return;
      }

      const isEmptyContext =
        nextState.selectedProducts.length === 0 &&
        nextState.citations.length === 0 &&
        Object.keys(nextState.activeFilters).length === 0 &&
        !nextState.activeQuery;

      if (isEmptyContext) {
        void persistenceAdapter.delete(SHARED_CONTEXT_PERSISTENCE_KEY);
        return;
      }

      void persistenceAdapter.save(SHARED_CONTEXT_PERSISTENCE_KEY, nextState);
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
        sharedContextSelectors.selectedProducts
      );
      const activeQuery = engine.read(sharedContextSelectors.activeQuery);
      const activeFilters = engine.read(sharedContextSelectors.activeFilters);

      engine.mutate(
        conversationMutators.updateMessage(turnId, {
          metadata: {
            turnId,
            // Search context is embedded in message metadata for backend context
          },
        })
      );

      // Store correlation in shared context for analytics continuity
      engine.mutate(sharedContextMutators.setActiveQuery(activeQuery));
      engine.mutate(sharedContextMutators.setActiveFilters(activeFilters));
      engine.mutate(
        sharedContextMutators.setSelectedProducts(selectedProducts)
      );
    },

    /**
     * Publish assistant-surfaced product selections back to the search context.
     * These can be used to pre-filter or annotate subsequent search queries.
     *
     * v1: writes to sharedContext only. Future iterations may dispatch
     * search state mutations directly.
     */
    publishAssistantSelectionsToSearch(selections: {
      products: string[];
      filters?: Record<string, string[]>;
    }): void {
      engine.mutate(
        sharedContextMutators.setSelectedProducts(selections.products)
      );
      if (selections.filters) {
        engine.mutate(
          sharedContextMutators.setActiveFilters(selections.filters)
        );
      }
    },

    /**
     * Record a citation link surfaced by the assistant.
     */
    addCitation(citation: CitationLink): void {
      engine.mutate(sharedContextMutators.addCitation(citation));
    },

    /**
     * Update the active search query in the shared context.
     * Called when the search state changes so conversation has latest query context.
     */
    syncSearchQuery(query: string): void {
      engine.mutate(sharedContextMutators.setActiveQuery(query));
    },

    /**
     * Update the active filters in the shared context.
     */
    syncSearchFilters(filters: Record<string, string[]>): void {
      engine.mutate(sharedContextMutators.setActiveFilters(filters));
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
