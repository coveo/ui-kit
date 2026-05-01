/**
 * Layer 1: Adapter Interfaces
 *
 * Pluggable adapter contracts for transport, auth, persistence, orchestration,
 * and analytics. Adapters handle environment I/O; controllers own domain state.
 *
 * Architecture rule: adapters are injected at engine initialization and passed
 * to controllers. They never import from Layer 0 state interfaces.
 */

import type {OrchestrationSnapshot} from '@/src/core/interface/orchestration/types.js';

// ============================================================================
// TransportAdapter
// ============================================================================

export type TransportRequest = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  signal?: AbortSignal;
};

export type TransportResponse = {
  status: number;
  data: unknown;
};

export type StreamRequest = {
  path: string;
  body?: unknown;
  signal?: AbortSignal;
  onChunk: (chunk: Uint8Array) => void;
  onError: (error: {code: string; message: string}) => void;
  onClose: (code?: number) => void;
};

export type RetryPolicy = {
  maxRetries: number;
  backoffMs: number;
  retryableStatusCodes: number[];
};

/**
 * Abstraction over request/response and SSE streaming transports.
 * Implementations may target fetch, Node http, or test stubs.
 */
export interface TransportAdapter {
  send(request: TransportRequest): Promise<TransportResponse>;
  openStream(request: StreamRequest): Promise<void>;
  abort(reason?: string): void;
  retryPolicy?: RetryPolicy;
}

// ============================================================================
// AuthAdapter
// ============================================================================

export type TokenMetadata = {
  expiresAt?: number;
  scope?: string;
};

/**
 * Token retrieval and refresh abstraction.
 * Controllers call getToken() before each authenticated request.
 */
export interface AuthAdapter {
  getToken(): Promise<string>;
  refreshToken(): Promise<string>;
  getTokenMetadata(): TokenMetadata;
}

// ============================================================================
// PersistenceAdapter
// ============================================================================

/**
 * Storage abstraction across browser (localStorage/sessionStorage),
 * server (Redis/DB), and native (AsyncStorage) runtimes.
 */
export interface PersistenceAdapter {
  save(key: string, payload: unknown): Promise<void>;
  load(key: string): Promise<unknown | null>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

// ============================================================================
// OrchestrationAdapter
// ============================================================================

export type OrchestrationContext = {
  lastUserMessage?: string;
  recentToolResults?: Array<{toolId: string; status: string}>;
  searchResultsCount?: number;
};

/**
 * Orchestration decision provider.
 *
 * Two implementations are expected:
 *  - `localHeuristicAdapter`: simple English-only heuristic (default for dev/preview)
 *  - `backendSnapshotAdapter`: authoritative platform backend (future production)
 *
 * Both must conform to this interface so the OrchestrationController contract
 * is unchanged when the backend reaches required capability.
 */
export interface OrchestrationAdapter {
  getSnapshot(context: OrchestrationContext): Promise<OrchestrationSnapshot>;
}

// ============================================================================
// AnalyticsAdapter (minimal POC)
// ============================================================================

export type AnalyticsEvent = {
  type: 'search' | 'conversation' | 'orchestration';
  name: string;
  metadata?: Record<string, unknown>;
};

/**
 * Cross-domain event emission. Minimal POC version; will evolve.
 */
export interface AnalyticsAdapter {
  emit(event: AnalyticsEvent): void;
}

// ============================================================================
// Adapter bundle type
// ============================================================================

export type UnifiedAdapters = {
  transport: TransportAdapter;
  auth: AuthAdapter;
  persistence: PersistenceAdapter;
  orchestration: OrchestrationAdapter;
  analytics?: AnalyticsAdapter;
};
