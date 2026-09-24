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
export type {Session, SessionConfig, A2uiClientMessage} from '@/src/session/create-session.js';

// ── Injected-contract type (the runtime's decoupling seam) ───────────────────
export type {ContractsSchema, ComponentContractSchema} from '@/src/session/contracts.js';

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
