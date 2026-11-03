import type {RequestScopeFields} from '@/src/internal/api/unified/unified-endpoint-types.js';
import type {ContractsSchema} from './contracts.js';
import {createSessionRuntime, type Session, type SessionConfig} from './create-session.js';

/**
 * **For internal Coveo use only.** Not supported for customers; may change without notice.
 *
 * The configuration accepted by {@link createPrivateSession}: the public `SessionConfig`,
 * with `agentConfigurationId` and `trackingId` optional, plus optional locale fields. Each
 * of these fields that is set is sent with every converse request; an unset one is left
 * out. The session doesn't validate them; the endpoint does.
 */
export interface PrivateSessionConfig<
  TContracts extends ContractsSchema = ContractsSchema,
> extends Omit<SessionConfig<TContracts>, 'agentConfigurationId' | 'trackingId'> {
  /** The identifier of the configured agent that answers the session, when the endpoint needs one. */
  agentConfigurationId?: string;
  /** The tracking identifier of the experience, when the endpoint needs one. */
  trackingId?: string;
  /** The language of the experience, such as `'en'`. */
  language?: string;
  /** The country of the experience, such as `'US'`. */
  country?: string;
  /** The currency of the experience, such as `'USD'`. */
  currency?: string;
}

const REQUEST_SCOPE_KEYS = [
  'agentConfigurationId',
  'trackingId',
  'language',
  'country',
  'currency',
] as const satisfies readonly (keyof RequestScopeFields & keyof PrivateSessionConfig)[];

/**
 * **For internal Coveo use only.** Not supported for customers; may change without notice.
 *
 * Creates a session, like the public `createSession`, for a Coveo internal application
 * that calls a private converse endpoint. `agentConfigurationId` and `trackingId` are
 * optional, and `language`, `country` and `currency` can be set; every one of them that is
 * set is sent with every converse request (`initialize`, prompts and actions).
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
 *   language: 'en',
 *   country: 'US',
 *   currency: 'USD',
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
