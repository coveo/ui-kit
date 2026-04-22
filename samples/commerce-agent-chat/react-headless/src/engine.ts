import {
  buildCommerceEngine,
  buildSearch,
  buildSearchBox,
  buildAgentChat,
  buildAgentChatCatalog,
  type CommerceEngine,
  type CommerceEngineConfiguration,
  type ContextOptions,
  type Search,
  type SearchBox,
  type AgentChat,
  type AgentChatCatalog,
} from '@coveo/headless/commerce';

export interface EngineConfig {
  organizationId: string;
  accessToken: string;
  trackingId: string;
  language: string;
  country: string;
  currency: ContextOptions['currency'];
  contextUrl: string;
  environment: CommerceEngineConfiguration['environment'];
}

export interface EngineControllers {
  engine: CommerceEngine;
  search: Search;
  searchBox: SearchBox;
  agentChat: AgentChat;
  agentChatCatalog: AgentChatCatalog;
}

export function createEngineControllers(
  config: EngineConfig
): EngineControllers {
  const engine = buildCommerceEngine({
    configuration: {
      organizationId: config.organizationId,
      accessToken: config.accessToken,
      environment: config.environment,
      analytics: {
        trackingId: config.trackingId,
      },
      context: {
        language: config.language,
        country: config.country,
        currency: config.currency,
        view: {
          url: config.contextUrl,
        },
      },
    },
  });

  const search = buildSearch(engine, {enableResults: true});
  const searchBox = buildSearchBox(engine);
  const agentChat = buildAgentChat(engine);
  const agentChatCatalog = buildAgentChatCatalog(engine);

  return {engine, search, searchBox, agentChat, agentChatCatalog};
}

export function loadEngineConfig(): EngineConfig {
  const required = (key: string): string => {
    const value =
      (import.meta as unknown as {env: Record<string, string>}).env[key] ?? '';
    if (!value) {
      throw new Error(`Missing required env var: ${key}`);
    }
    return value;
  };

  const optional = (key: string, fallback: string): string =>
    (import.meta as unknown as {env: Record<string, string>}).env[key] ||
    fallback;

  return {
    organizationId: required('VITE_ORG_ID'),
    accessToken: required('VITE_ACCESS_TOKEN'),
    trackingId: required('VITE_TRACKING_ID'),
    language: optional('VITE_LANGUAGE', 'en'),
    country: optional('VITE_COUNTRY', 'US'),
    currency: optional('VITE_CURRENCY', 'USD') as ContextOptions['currency'],
    contextUrl: optional('VITE_CONTEXT_URL', 'https://example.com'),
    environment: optional(
      'VITE_ENVIRONMENT',
      'prod'
    ) as CommerceEngineConfiguration['environment'],
  };
}
