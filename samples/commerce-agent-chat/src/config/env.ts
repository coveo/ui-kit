export type AgentMode = 'local' | 'coveo-dev';

export interface CommerceConfig {
  agentMode: AgentMode;
  agentUrl: string;
  orgId: string;
  accessToken: string;
  platformUrl: string;
  trackingId: string;
  language: string;
  country: string;
  currency: string;
  timezone: string;
  clientId: string;
  contextUrl: string;
}

export function loadConfig(): CommerceConfig {
  const agentMode = (import.meta.env.VITE_AGENT_MODE ?? 'local') as AgentMode;
  const orgId = import.meta.env.VITE_ORG_ID;
  const accessToken = import.meta.env.VITE_ACCESS_TOKEN;
  const platformUrl = import.meta.env.VITE_PLATFORM_URL;
  const trackingId = import.meta.env.VITE_TRACKING_ID;
  const language = import.meta.env.VITE_LANGUAGE;
  const country = import.meta.env.VITE_COUNTRY;
  const currency = import.meta.env.VITE_CURRENCY;
  const timezone =
    import.meta.env.VITE_TIMEZONE ??
    Intl.DateTimeFormat().resolvedOptions().timeZone;
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const contextUrl = import.meta.env.VITE_CONTEXT_URL;

  // In coveo-dev mode, local Vite dev uses a proxy path to avoid browser CORS.
  // Outside local dev, fall back to the direct platform URL.
  const agentUrl =
    agentMode === 'coveo-dev'
      ? import.meta.env.DEV
        ? `/api/coveo-dev/rest/organizations/${orgId}/commerce/unstable/agentic/converse`
        : `${platformUrl}/rest/organizations/${orgId}/commerce/unstable/agentic/converse`
      : (import.meta.env.VITE_AGENT_URL ?? '');

  const missing: string[] = [];
  if (agentMode === 'local' && !import.meta.env.VITE_AGENT_URL)
    missing.push('VITE_AGENT_URL');
  if (!orgId) missing.push('VITE_ORG_ID');
  if (!accessToken) missing.push('VITE_ACCESS_TOKEN');
  if (!platformUrl) missing.push('VITE_PLATFORM_URL');
  if (!trackingId) missing.push('VITE_TRACKING_ID');
  if (!language) missing.push('VITE_LANGUAGE');
  if (!country) missing.push('VITE_COUNTRY');
  if (!currency) missing.push('VITE_CURRENCY');
  if (!clientId) missing.push('VITE_CLIENT_ID');
  if (!contextUrl) missing.push('VITE_CONTEXT_URL');

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Copy .env.example to .env.local and fill in values.'
    );
  }

  if (agentMode !== 'local' && agentMode !== 'coveo-dev') {
    throw new Error(
      `Invalid VITE_AGENT_MODE "${agentMode}". Must be "local" or "coveo-dev".`
    );
  }

  return {
    agentMode,
    agentUrl,
    orgId,
    accessToken,
    platformUrl,
    trackingId,
    language,
    country,
    currency,
    timezone,
    clientId,
    contextUrl,
  };
}
