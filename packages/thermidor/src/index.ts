/**
 * `@coveo/thermidor` is an experimental, framework-agnostic client for the Coveo unified converse
 * endpoint. The endpoint streams conversational messages, tool calls and schema-defined A2-UI
 * components; the client sends the consumer's input and folds what streams back into an
 * observable {@link Session}: its turns, its initialization and its A2-UI surfaces and state.
 *
 * The package exposes the session-client surface: the {@link createSession} factory, the
 * {@link Session} handle, the {@link Turn} / {@link TurnResponse} domain model, the
 * {@link SessionConfig | session configuration} and the versioned {@link SerializedSession}
 * shape.
 *
 * Outbound actions reach the session through the single entry point
 * {@link Session.dispatchAction}, wired directly as the renderer's `onAction` handler. The
 * session validates action payloads against the injected contracts itself, so the consumer never
 * runs Zod and writes no adapter glue.
 *
 * @packageDocumentation
 */

// ── Session factory + handle ────────────────────────────────────────────────
export {createSession} from '@/src/session/create-session.js';
export type {
  Session,
  SessionConfig,
  SessionSnapshot,
  A2uiClientMessage,
  SubmitPromptAction,
} from '@/src/session/create-session.js';

// ── Injected-contract type (the runtime's decoupling seam) ───────────────────
export type {
  ContractsSchema,
  ComponentContractSchema,
  ComponentActionNames,
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
  TurnAction,
  TurnResponse,
  TurnErrorReason,
  TurnStatus,
  TurnAgent,
  A2uiState,
  A2uiV09Message,
  Activity,
  AgentMessage,
  ToolCall,
  ToolCallStatus,
  DiscoveredSurface,
  SessionInitialization,
  SessionRequest,
  InitializeRequest,
  PromptRequest,
  ActionRequest,
  ActionError,
} from '@/src/session/types.js';

// ── Serialization ───────────────────────────────────────────────────────────
export type {
  SerializedSession,
  SerializedTurn,
  SerializedTurnResponse,
  SerializedTurnAgent,
  SerializedInitialization,
} from '@/src/session/serialize.js';
