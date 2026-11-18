import type {RequestScopeFields} from '@/src/internal/api/unified/unified-endpoint-types.js';
import type {ContractsSchema} from './contracts.js';
import {createSessionRuntime, type Session, type SessionConfig} from './create-session.js';

/**
 * **For internal Coveo use only.** Not supported for customers; may change without notice.
 *
 * The configuration accepted by {@link createPrivateSession}: the public `SessionConfig`,
 * with `agentConfigurationId` and `trackingId` optional. Each id that is set is sent with
 * every converse request; an unset one is left out. The session doesn't validate the ids;
 * the endpoint does. As with `createSession`, the required `navigatorContextProvider`
 * supplies the `language`, `country` and `currency` sent with every request.
 */
export interface PrivateSessionConfig<
  TContracts extends ContractsSchema = ContractsSchema,
> extends Omit<SessionConfig<TContracts>, 'agentConfigurationId' | 'trackingId'> {
  /** The identifier of the configured agent that answers the session, when the endpoint needs one. */
  agentConfigurationId?: string;
  /** The tracking identifier of the experience, when the endpoint needs one. */
  trackingId?: string;
  /**
   * The conversation session id the session opens with, so the caller knows it before the first request.
   * It must be a UUID. It is sent as `conversationSessionId` from the first request.
   * If the first request ends before the endpoint sends a token, the session drops the id and the
   * endpoint assigns one. It keeps the id when the endpoint refuses the request with an error
   * status other than 403, or when the request is never sent. It can't be combined with
   * `sessionToRestore`.
   */
  sessionId?: string;
}

/**
 * **For internal Coveo use only.** Not supported for customers; may change without notice.
 *
 * The session {@link createPrivateSession} returns: a `Session` that also exposes its
 * conversation session id.
 */
export interface PrivateSession<
  TContracts extends ContractsSchema = ContractsSchema,
> extends Session<TContracts> {
  /**
   * The conversation session id the session's requests carry.
   * From creation, it is the configured {@link PrivateSessionConfig.sessionId} or the restored id.
   * Otherwise it is `undefined` until the endpoint sends one, and then it is that id.
   * If the session drops the configured id, it is `undefined` again until the endpoint sends one.
   * It also drops a restored id that has no token, the same way.
   */
  readonly sessionId: string | undefined;
}

const REQUEST_SCOPE_KEYS = [
  'agentConfigurationId',
  'trackingId',
] as const satisfies readonly (keyof RequestScopeFields & keyof PrivateSessionConfig)[];

/**
 * **For internal Coveo use only.** Not supported for customers; may change without notice.
 *
 * Creates a session, like the public `createSession`, for a Coveo internal application
 * that calls a private converse endpoint. `agentConfigurationId` and `trackingId` are
 * optional; each one that is set is sent with every converse request (`initialize`,
 * prompts and actions), with the navigator context's locale. An optional `sessionId` sets
 * the conversation session id from the first request, and the returned session exposes it
 * as {@link PrivateSession.sessionId}.
 *
 * @example
 * ```ts
 * import {createPrivateSession} from '@coveo/thermidor/private';
 *
 * const session = createPrivateSession({
 *   contracts,
 *   organizationId,
 *   accessToken,
 *   endpoint: privateConverseUrl,
 *   trackingId,
 *   sessionId: crypto.randomUUID(),
 *   navigatorContextProvider: () => ({...getNavigatorContext(), language: 'en', country: 'US', currency: 'USD'}),
 * });
 * ```
 */
export function createPrivateSession<TContracts extends ContractsSchema>(
  config: PrivateSessionConfig<TContracts>
): PrivateSession<TContracts> {
  if (config.sessionId !== undefined && config.sessionToRestore !== undefined) {
    throw new Error('createPrivateSession accepts a sessionId or a sessionToRestore, not both.');
  }
  const requestScope: RequestScopeFields = {};
  for (const key of REQUEST_SCOPE_KEYS) {
    if (config[key] !== undefined) {
      requestScope[key] = config[key];
    }
  }
  const restored = config.sessionToRestore;
  const unconfirmedSessionId =
    config.sessionId ?? (restored?.sessionToken === undefined ? restored?.sessionId : undefined);
  const {session, readSessionId} = createSessionRuntime(
    config,
    requestScope,
    config.sessionId,
    unconfirmedSessionId
  );
  return Object.defineProperty(session, 'sessionId', {
    get: readSessionId,
    enumerable: true,
  }) as PrivateSession<TContracts>;
}
