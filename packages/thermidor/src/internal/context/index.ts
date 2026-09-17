/**
 * Client-owned context config types (ADR-012). These are the inputs a consumer
 * supplies through pull-based providers on `SessionConfig` — distinct from the
 * wire request DTOs they are mapped onto. Future context concepts (e.g. a
 * search context) belong here alongside the navigator and commerce contexts.
 */
export type {NavigatorContext, NavigatorContextProvider} from './navigator-context.js';
export type {
  CommerceCartItem,
  CommerceContext,
  CommerceContextProvider,
} from './commerce-context.js';
