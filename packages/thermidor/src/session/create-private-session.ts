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
 * prompts and actions), with the navigator context's locale.
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
 *   navigatorContextProvider: () => ({...getNavigatorContext(), language: 'en', country: 'US', currency: 'USD'}),
 * });
 * ```
 */
export function createPrivateSession<TContracts extends ContractsSchema>(
  config: PrivateSessionConfig<TContracts>
): Session<TContracts> {
  const requestScope: RequestScopeFields = {};
  for (const key of REQUEST_SCOPE_KEYS) {
    if (config[key] !== undefined) {
      requestScope[key] = config[key];
    }
  }
  return createSessionRuntime(config, requestScope);
}
