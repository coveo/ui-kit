/**
 * `@coveo/thermidor` public surface.
 *
 * The package exposes exactly the session-client surface: the `createSession`
 * factory, the `Session` handle, the `Turn` / `TurnResponse` domain model, the
 * session configuration, and the versioned serialization shape.
 *
 * Outbound actions reach the core through the single consumer-facing entry
 * point {@link Session.dispatchAction}, wired directly as the renderer's
 * `onAction` handler; the action-payload validation happens internally, so the
 * consumer never runs Zod and writes no adapter glue.
 *
 * The entry is intentionally free of state-library concepts (no store, slice,
 * selector, thunk, or reducer) and free of raw transport DTO shapes
 * (`CommerceRequestModel`, `A2uiAction`, etc.).
 */

// ── Session factory + handle ────────────────────────────────────────────────
export {createSession} from '@/src/session/create-session.js';
export type {
  Session,
  SessionActions,
  SessionConfig,
  A2uiClientMessage,
  SubmitPromptAction,
} from '@/src/session/create-session.js';

// ── Dispatch coordination (SCOPED FOR REMOVAL with `src/actions`) ────────────
// The client-side action queue and its dropping rules. Delete this block together with that
// directory and `Session.actions` once the producer owns the queue; nothing else depends on it.
export {
  createDispatchCoordinator,
  createSettledDispatch,
} from '@/src/actions/dispatch-coordinator.js';
export type {
  CoalesceIntent,
  CoalescePolicy,
  DispatchCoordinator,
  DispatchCoordinatorOptions,
  DispatchId,
  DispatchOutcome,
  DispatchSnapshot,
  IssuedDispatch,
} from '@/src/actions/dispatch-coordinator.js';
export {createDispatchTracker} from '@/src/actions/dispatch-tracker.js';
export type {
  DispatchSource,
  DispatchTracker,
  DispatchTrackerOptions,
} from '@/src/actions/dispatch-tracker.js';

// ── Stale regions (independent of the block above) ─────────────────────────
// The other half of the latency problem, and it outlives the client-side queue: which regions of
// the screen the producer has not caught up with. Independent of the controller below — a
// consumer that dims without showing anything optimistically needs only this.
export {createStaleScopes} from '@/src/optimistic/stale-scope.js';
export type {StaleScope, StaleScopes} from '@/src/optimistic/stale-scope.js';

// ── Optimistic gesture controller (SHRINKS with `src/actions`) ──────────────
// Holds one producer value's gestures on screen until the producer has answered them, and turns
// each gesture into a dispatch. Framework-agnostic: a view layer binds to its store and hands it
// the producer value.
export {createOptimisticValue} from '@/src/optimistic/optimistic-value.js';
export type {
  DispatchQueue,
  GestureDeclaration,
  OptimisticGesture,
  OptimisticNext,
  OptimisticTransform,
  OptimisticValueController,
  OptimisticValueOptions,
} from '@/src/optimistic/optimistic-value.js';

// ── Injected-contract type (the runtime's decoupling seam) ───────────────────
export type {
  ContractsSchema,
  ComponentContractSchema,
  ParsableSchema,
  SafeParseResult,
  ParseIssue,
} from '@/src/session/contracts.js';

// ── Client-owned context config types ───────────────────────────────────────
export type {
  NavigatorContext,
  NavigatorContextProvider,
  CommerceContext,
  CommerceCartItem,
  CommerceContextProvider,
} from '@/src/internal/context/index.js';

// ── Domain / view types ─────────────────────────────────────────────────────
export type {
  Turn,
  TurnInput,
  TurnResponse,
  TurnStatus,
  TurnAgent,
  A2uiState,
  A2uiV09Message,
  Activity,
  AgentMessage,
  ReasoningStep,
  ReasoningMessageStep,
  ToolCallStep,
  ToolCallStatus,
  DiscoveredSurface,
} from '@/src/session/types.js';

// ── Serialization ───────────────────────────────────────────────────────────
export type {
  SerializedSession,
  SerializedTurn,
  SerializedTurnResponse,
  SerializedTurnAgent,
} from '@/src/session/serialize.js';
