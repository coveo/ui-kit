/**
 * Which agent's converse route the sample addresses, set by `VITE_COVEO_AGENT`
 * and `commerce` by default. Like the transport settings, it is not part of the
 * organization bundle in `public-sample-configuration.ts`.
 *
 * Shared between `src/env.ts` (browser) and `vite.config.ts` (dev-server proxy)
 * so both ends address the same route.
 */
const DEFAULT_AGENT = 'commerce';
const AGENT_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export function resolveConverseAgent(value: string | undefined): string {
  const agent = value?.trim() || DEFAULT_AGENT;
  if (!AGENT_PATTERN.test(agent)) {
    throw new Error(`VITE_COVEO_AGENT must be an agent id such as "commerce", got "${agent}".`);
  }

  return agent;
}

export function getAgUiPath(organizationId: string, agent: string): string {
  return `/api/preview/organizations/${organizationId}/agents/${agent}/agui`;
}
