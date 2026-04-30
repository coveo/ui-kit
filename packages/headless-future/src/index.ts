/**
 * @thermidor/headless - Unified Headless State Management Library
 *
 * Exports:
 * - Layer 2: Public Controllers (search, conversation, streaming, orchestration, surfaces, context-bridge)
 * - Layer 3: Advanced Mutators
 */

// TODO: Encapsulate Engine to export a "public" Engine.
export {Engine} from './core/index.js';
export * from './public/actions/index.js';
export * from './public/controllers/index.js';

// Adapter types (Layer 1 contracts, framework-agnostic)
export type {
  TransportAdapter,
  AuthAdapter,
  PersistenceAdapter,
  OrchestrationAdapter,
  AnalyticsAdapter,
  UnifiedAdapters,
  TransportRequest,
  TransportResponse,
  StreamRequest,
  RetryPolicy,
} from './api/adapters/types.js';

// Protocol types (normalized stream events)
export type {NormalizedStreamEvent} from './api/protocol/types.js';

// Core domain types
export type {
  ConversationMessage,
  ConversationTurn,
  ConversationSession,
  OrchestrationSnapshot,
  OrchestrationMode,
  StructuredSurface,
} from './core/interface/types.js';
