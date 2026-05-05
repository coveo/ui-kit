/**
 * Layer 2: OrchestrationController
 *
 * Owns current interaction mode and phase state representation for the client.
 *
 * Responsibilities:
 *  - Apply server-issued (or local-heuristic) orchestration snapshots
 *  - Enforce transition validity; backend snapshot wins for mode/phase
 *  - Accept local hints without overriding backend authority
 *  - Expose mode/phase/experience selectors for UI and other controllers
 *
 * Non-responsibilities: generating policy decisions, transport mechanics, UI composition.
 *
 * The OrchestrationAdapter interface decouples the controller from whether the
 * snapshot comes from a local heuristic service or the platform backend.
 * Swapping implementations requires no controller changes.
 */

import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {orchestrationSlice} from '@/src/core/internal/orchestration/orchestration-slice.js';
import * as orchestrationSelectors from '@/src/core/interface/orchestration/orchestration-selectors.js';
import * as orchestrationMutators from '@/src/core/interface/orchestration/orchestration-mutators.js';
import type {OrchestrationSnapshot} from '@/src/core/interface/orchestration/orchestration-types.js';
import type {OrchestrationAdapter} from '@/src/api/adapters/types.js';
import {createSelector} from '@reduxjs/toolkit';

const stateSelect = createSelector(
  [
    orchestrationSelectors.currentMode,
    orchestrationSelectors.currentPhase,
    orchestrationSelectors.transitionReason,
    orchestrationSelectors.confidence,
    orchestrationSelectors.lastSnapshotAt,
  ],
  (
    currentMode,
    currentPhase,
    transitionReason,
    confidence,
    lastSnapshotAt
  ) => ({
    currentMode,
    currentPhase,
    transitionReason,
    confidence,
    lastSnapshotAt,
  })
);

export const buildOrchestrationController = (
  engine: Engine,
  adapter: OrchestrationAdapter
) => {
  const fullEngine = getFullEngine(engine);

  fullEngine.adoptSlice(orchestrationSlice);

  return {
    /**
     * Apply a backend-issued orchestration snapshot directly.
     * Use this when the backend pushes a snapshot via SSE or HTTP.
     */
    applyServerSnapshot(snapshot: OrchestrationSnapshot): void {
      fullEngine.mutate(orchestrationMutators.applySnapshot(snapshot));
    },

    /**
     * Request an orchestration decision based on current context.
     * Routes through the injected OrchestrationAdapter; the source can be
     * a local heuristic service or the platform backend with no API change.
     *
     * Falls back gracefully when the endpoint is unavailable.
     */
    async requestModeHint(context: {
      lastUserMessage?: string;
      searchResultsCount?: number;
    }): Promise<void> {
      try {
        const snapshot = await adapter.getSnapshot(context);
        fullEngine.mutate(orchestrationMutators.applySnapshot(snapshot));
      } catch {
        // Endpoint unavailable — fall back to default mode (search-first)
        fullEngine.mutate(orchestrationMutators.setUnavailable(true));
      }
    },

    get state() {
      return engine.read(stateSelect);
    },

    subscribe(callback: () => void) {
      return engine.subscribe(stateSelect, callback);
    },
  };
};

export type OrchestrationController = ReturnType<
  typeof buildOrchestrationController
>;
