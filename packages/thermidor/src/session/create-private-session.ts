import {CLIENT_OWNED_REQUEST_KEYS} from '@/src/internal/api/unified/unified-endpoint-types.js';
import type {ContractsSchema, ParsableSchema} from './contracts.js';
import {
  createSessionRuntime,
  type RequestContract,
  type Session,
  type SessionConfig,
} from './create-session.js';

/**
 * **For internal Coveo use only.** Not supported for customers; may change without notice.
 *
 * The request contract an internal Coveo application injects into
 * {@link createPrivateSession}: the fields it sends with every converse request, and the
 * schema they must match.
 */
export interface PrivateRequestContract {
  /**
   * The schema the fields must match, such as a Zod object schema. The fields are parsed
   * with it before every request, and the request sends the parsed value.
   */
  schema: ParsableSchema;
  /**
   * Returns the fields to send, for example `{trackingId, language, country, currency}`.
   * Called on every request (`initialize`, prompts and actions), so it can return the
   * current values. It can't set a key the session builds itself: `clientId`, `message`,
   * `action`, `conversationSessionId`, `conversationToken`, `context` or `pinnedProducts`.
   */
  fields: () => Record<string, unknown>;
}

/**
 * **For internal Coveo use only.** Not supported for customers; may change without notice.
 *
 * The configuration accepted by {@link createPrivateSession}: the public `SessionConfig`
 * without `agentConfigurationId` and `trackingId`, plus the injected `request` contract.
 */
export interface PrivateSessionConfig<
  TContracts extends ContractsSchema = ContractsSchema,
> extends Omit<SessionConfig<TContracts>, 'agentConfigurationId' | 'trackingId'> {
  /** The request fields the session sends with every converse request, and their schema. */
  request: PrivateRequestContract;
}

const CLIENT_OWNED_KEYS: ReadonlySet<string> = new Set(CLIENT_OWNED_REQUEST_KEYS);

function assertFieldsRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`createPrivateSession: the request ${label} must be an object.`);
  }
  const owned = Object.keys(value).filter((key) => CLIENT_OWNED_KEYS.has(key));
  if (owned.length > 0) {
    throw new Error(
      `createPrivateSession: the request ${label} can't set ${owned.join(', ')}: the session builds ${owned.length === 1 ? 'it' : 'them'} itself.`
    );
  }
  return value as Record<string, unknown>;
}

function createInjectedRequestContract(request: PrivateRequestContract): RequestContract {
  return {
    readFields() {
      const fields = assertFieldsRecord(request.fields(), 'fields');
      const result = request.schema.safeParse(fields);
      if (!result.success) {
        const issues = result.error.issues
          .map(({path, message}) =>
            path.length > 0 ? `${path.map(String).join('.')}: ${message}` : message
          )
          .join('; ');
        throw new Error(`createPrivateSession: invalid request fields: ${issues}`);
      }
      return assertFieldsRecord(result.data, 'schema output');
    },
  };
}

/**
 * **For internal Coveo use only.** Not supported for customers; may change without notice.
 *
 * Creates a session, like the public `createSession`, whose converse requests carry the
 * fields of an injected request contract instead of the built-in `agentConfigurationId`
 * and `trackingId`. Coveo internal applications use it to call a private converse
 * endpoint with their own request shape.
 *
 * The fields are read and parsed against `request.schema` before every request. The first
 * read happens here, so invalid fields throw from this call; after that, invalid fields
 * fail the request like any request error. Fields that set a key the session builds
 * itself are invalid.
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
 *   request: {
 *     schema: z.object({trackingId: z.string(), language: z.string(), country: z.string(), currency: z.string()}),
 *     fields: () => ({trackingId, ...currentLocale()}),
 *   },
 * });
 * ```
 */
export function createPrivateSession<TContracts extends ContractsSchema>(
  config: PrivateSessionConfig<TContracts>
): Session<TContracts> {
  const requestContract = createInjectedRequestContract(config.request);
  requestContract.readFields();
  return createSessionRuntime(config, requestContract);
}
