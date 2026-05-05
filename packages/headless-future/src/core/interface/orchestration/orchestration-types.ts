/**
 * Orchestration Feature Types
 *
 * Represents backend-driven interaction mode and phase transitions.
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

export type OrchestrationMode = 'search-first' | 'assistant-first' | 'blended';

/**
 * Stable wire contract for orchestration decisions.
 * Both transitional (local heuristic) and future (platform backend) providers
 * must conform to this schema.
 */
export type OrchestrationSnapshot = {
  mode: OrchestrationMode;
  phase?: string;
  reason?: string;
  confidence?: number;
  timestamp: number;
  correlationId: string;
  metadata?: {
    /** Identifies which provider emitted this snapshot */
    provider?: string;
    /** Mark heuristic mode as English-only experimental */
    locale?: string;
  };
};

export interface OrchestrationState {
  currentMode: OrchestrationMode;
  currentPhase?: string;
  transitionReason?: string;
  confidence?: number;
  lastSnapshotAt: number;
  /** True when the orchestration endpoint was unreachable; falls back to default mode */
  isUnavailable: boolean;
}
