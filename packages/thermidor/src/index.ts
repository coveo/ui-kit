/**
 * `@coveo/thermidor` is an experimental, framework-agnostic client for the Coveo unified converse
 * endpoint. The endpoint streams conversational messages, tool calls and schema-defined A2-UI
 * components; the client sends the consumer's input and turns what streams back into an
 * observable {@link Session}: its turns, its initialization and its A2-UI surfaces and state.
 *
 * Start with {@link createSession}, which returns the {@link Session} handle. Read the session
 * through {@link Session.subscribe} and {@link Session.getSnapshot}, and send prompts and
 * component actions through {@link Session.dispatchAction}, which is also the renderer's
 * action handler. The session validates action payloads against the injected contracts
 * itself, so the consumer never runs Zod and writes no adapter code.
 *
 * @example
 * Create a session, render its state and submit a prompt. The component contracts come from an
 * A2-UI contract package, such as `@coveo/thermidor-schema`.
 *
 * ```ts
 * import {createSession} from '@coveo/thermidor';
 * import {ComponentContractsSchema} from '@coveo/thermidor-schema';
 *
 * const session = createSession({
 *   contracts: ComponentContractsSchema,
 *   organizationId: 'my-org',
 *   accessToken: 'xx-token',
 *   agentConfigurationId: '00000000-0000-0000-0000-000000000000',
 *   trackingId: 'my-tracking-id',
 *   navigatorContextProvider: () => ({
 *     clientId: 'my-client-id',
 *     location: window.location.href,
 *     referrer: document.referrer,
 *     userAgent: navigator.userAgent,
 *     language: 'en',
 *     country: 'US',
 *     currency: 'USD',
 *   }),
 * });
 *
 * session.subscribe(() => {
 *   const {turns, a2uiMessages, request} = session.getSnapshot();
 *   render(turns, a2uiMessages, request);
 * });
 *
 * await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'show me running shoes'}});
 * ```
 *
 * @groupDescription Session
 * Create a session, read its state and send it prompts and actions.
 *
 * @groupDescription Turns
 * A turn pairs a prompt or a turn-opening action with what the endpoint streams back: the
 * agent's messages and tool calls, the activities and the surfaces they create.
 *
 * @groupDescription Actions
 * The messages {@link Session.dispatchAction} accepts, and how a failed action is reported.
 *
 * @groupDescription Surfaces
 * The A2-UI surfaces the endpoint creates, their data model and the renderer stream.
 *
 * @groupDescription Requests and initialization
 * The request the session is sending, as {@link Session.request}, and the `initialize` run that
 * opens the session.
 *
 * @groupDescription Context
 * The navigator and commerce context the session reads from the consumer's providers and sends
 * with every request.
 *
 * @groupDescription Contracts
 * The structural types the injected component contracts must match, such as a Zod discriminated
 * union from an A2-UI contract package.
 *
 * @groupDescription Serialization
 * The versioned shape {@link Session.serialize} returns and {@link SessionConfig.sessionToRestore}
 * accepts, to persist a session and restore it later.
 *
 * @packageDocumentation
 */

// ── Session factory + handle ────────────────────────────────────────────────
export {createSession} from '@/src/session/create-session.js';
export type {
  Session,
  SessionConfig,
  SessionSnapshot,
  A2uiRendererAction,
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
  A2uiMessage,
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
  ConcurrentFailure,
  ConcurrentRequest,
} from '@/src/session/types.js';

// ── Serialization ───────────────────────────────────────────────────────────
export type {
  SerializedSession,
  SerializedTurn,
  SerializedTurnResponse,
  SerializedTurnAgent,
  SerializedInitialization,
} from '@/src/session/serialize.js';
