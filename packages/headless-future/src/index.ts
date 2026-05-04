/**
 * @coveo/headless-future - Headless State Management Library
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

// Concrete adapter implementations (ready-to-use defaults)
export {BrowserTransportAdapter} from './api/adapters/browser-transport.js';
export type {BrowserTransportOptions} from './api/adapters/browser-transport.js';
export {DefaultAuthAdapter} from './api/adapters/default-auth.js';
export type {DefaultAuthOptions} from './api/adapters/default-auth.js';
export {LocalHeuristicOrchestrationAdapter} from './api/adapters/local-heuristic-orchestration.js';
export {IndexedDbPersistenceAdapter} from './api/adapters/indexeddb-persistence.js';
export {
  CONVERSATION_PERSISTENCE_KEY,
  SURFACES_PERSISTENCE_KEY,
  SHARED_CONTEXT_PERSISTENCE_KEY,
} from './api/adapters/persistence-keys.js';

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
} from './core/interface/interface-types.js';
