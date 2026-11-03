/**
 * Builds the session's requests from the context providers and the session keys, read fresh
 * each time.
 */

import type {
  A2uiAction,
  ClientOwnedRequestFields,
  ConverseRequestModel,
  InitializeAction,
  RequestScopeFields,
} from '@/src/internal/api/unified/unified-endpoint-types.js';
import type {ActionOrigin} from './action-cache.js';
import type {SessionStore} from './store.js';
import type {SessionRuntimeConfig, Turn} from './types.js';

export interface RequestBuilder {
  buildConversationRequest(prompt: string): ConverseRequestModel;
  buildActionRequest(action: A2uiAction | InitializeAction): ConverseRequestModel;
}

/** The action a dispatch sends, stamped now. */
export function toA2uiAction(origin: ActionOrigin & {context?: unknown}): A2uiAction {
  return {
    surfaceId: origin.surfaceId,
    name: origin.name,
    sourceComponentId: origin.sourceComponentId,
    timestamp: new Date().toISOString(),
    context: origin.context,
  };
}

export function createRequestBuilder(
  config: Pick<SessionRuntimeConfig, 'navigatorContextProvider' | 'commerceContextProvider'>,
  requestScope: Readonly<RequestScopeFields>,
  store: SessionStore<Turn>
): RequestBuilder {
  /**
   * Builds the request fields shared by prompt turns and the private dispatch path,
   * invoking BOTH context providers fresh at request-build time. Because the providers
   * are functions, context is never stored on the session and is never
   * serialized; a restored session therefore reads today's context from the
   * providers rather than any persisted value.
   *
   * Commerce-context encoding — the two encodings are
   * distinguishable on the wire:
   *   - ABSENT (no `commerceContextProvider`): `cart: []` with NO
   *     `pinnedProducts`, NO `source`, NO `custom`.
   *   - PRESENT (`commerceContextProvider` supplied): the provider's `cart`
   *     (meaningful even when empty) plus `pinnedProducts`, `source`, and
   *     `custom` carried from what the provider returns.
   */
  function buildBaseRequest(): Omit<ClientOwnedRequestFields, 'message' | 'action'> {
    const navigatorContext = config.navigatorContextProvider?.();
    const commerceContext = config.commerceContextProvider?.();
    const {sessionId, sessionToken} = store.getState();

    const view = {
      url: navigatorContext?.location ?? null,
      referrer: navigatorContext?.referrer ?? null,
    };
    const user: Record<string, unknown> = {userAgent: navigatorContext?.userAgent ?? null};

    const base: Omit<ClientOwnedRequestFields, 'message' | 'action'> = {
      clientId: navigatorContext?.clientId ?? undefined,
      conversationSessionId: sessionId,
      conversationToken: sessionToken,
      context:
        commerceContext === undefined
          ? // "absent" encoding: cart only, no source/custom.
            {view, user, cart: []}
          : // "present" encoding: carry the provider's fields verbatim.
            {
              view,
              user,
              cart: commerceContext.cart,
              source: commerceContext.source ?? [],
              custom: commerceContext.custom ?? {},
            },
    };

    if (commerceContext !== undefined) {
      base.pinnedProducts = commerceContext.pinnedProducts ?? [];
    }

    return base;
  }

  return {
    // The scope fields come first, in the order the public request has always sent them.
    buildConversationRequest(prompt) {
      return {...requestScope, ...buildBaseRequest(), message: prompt, action: null};
    },
    buildActionRequest(action) {
      return {...requestScope, ...buildBaseRequest(), message: null, action};
    },
  };
}
