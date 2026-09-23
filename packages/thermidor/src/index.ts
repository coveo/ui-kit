/**
 * `@coveo/thermidor` public surface.
 *
 * The package exposes exactly the session-client surface: the `createSession`
 * factory, the `Session` handle, the `Turn` / `TurnResponse` domain model, the
 * session configuration, the versioned serialization shape, and the generic,
 * schema-validated `RemoteController` type.
 *
 * The entry is intentionally free of state-library concepts (no store, slice,
 * selector, thunk, or reducer) and free of raw transport DTO shapes
 * (`CommerceRequestModel`, `A2uiAction`, etc.). The internal remote-controller
 * seam (`buildRemoteController`, `RemoteControllerSource`,
 * `selectRemoteControllerState`) is likewise kept out of the public exports.
 */

// ── Session factory + handle ────────────────────────────────────────────────
export {createSession} from '@/src/session/create-session.js';
export type {
  Session,
  SessionConfig,
  RemoteAction,
  RemoteControllerOptions,
} from '@/src/session/create-session.js';

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

// ── Generic, schema-validated remote controller ─────────────────────────────
export type {Unsubscribe} from '@/src/session/store.js';
export type {
  Controller,
  RemoteController,
  ContractsSchema,
  ComponentContractSchema,
  ComponentTypeOf,
  ContractFor,
  StateFor,
  ActionNameFor,
  ActionPayloadFor,
} from '@/src/remote-controller/types.js';
