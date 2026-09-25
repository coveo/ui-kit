import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv} from 'vite';
import {PUBLIC_SAMPLE_CONFIGURATION} from './src/public-sample-configuration.js';

type PlatformEnvironment = 'prod' | 'dev' | 'stg' | 'hipaa';

function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true;
  }

  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false;
  }

  return undefined;
}

function resolveEnvironment(value: string | undefined): PlatformEnvironment {
  if (value === 'prod' || value === 'dev' || value === 'stg' || value === 'hipaa') {
    return value;
  }

  return 'dev';
}

function getOrganizationPlatformEndpoint(
  organizationId: string,
  environment: PlatformEnvironment
): string {
  const environmentSuffix = environment === 'prod' ? '' : environment;
  return `https://${organizationId}.org${environmentSuffix}.coveo.com`;
}

export function resolveProxyTargets(
  organizationId: string | undefined,
  endpointOverride: string | undefined,
  environment: PlatformEnvironment
) {
  if (!organizationId) {
    return undefined;
  }

  const platform = getOrganizationPlatformEndpoint(organizationId, environment);

  return {
    agentGateway: endpointOverride || platform,
    platform,
  };
}

export function resolveAgentRuntimeHeaders(
  runtimeName: string | undefined,
  runtimeQualifier: string | undefined
) {
  const name = runtimeName?.trim();
  const qualifier = runtimeQualifier?.trim();

  if (!name) {
    return undefined;
  }

  return {
    'x-coveo-agent-runtime-name': name,
    ...(qualifier ? {'x-coveo-agent-runtime-qualifier': qualifier} : {}),
  };
}

/**
 * Resolves the organization the dev server should proxy to, falling back to the
 * public sample organization when nothing is configured. Applied here rather
 * than inside {@link resolveProxyTargets} so that function keeps its pure
 * "no organization means no proxy" contract.
 *
 * This must agree with `src/env.ts`: the browser routes through the proxy in dev
 * mode, so a proxy that is absent (or points elsewhere) turns every agent call
 * into a 404 against the dev server.
 */
function resolveConfiguredOrganization(env: Record<string, string>) {
  const organizationId = env.VITE_COVEO_ORGANIZATION_ID?.trim();
  if (organizationId) {
    return {
      organizationId,
      environment: resolveEnvironment(env.VITE_COVEO_PLATFORM_ENVIRONMENT),
    };
  }

  return {
    organizationId: PUBLIC_SAMPLE_CONFIGURATION.VITE_COVEO_ORGANIZATION_ID,
    environment: resolveEnvironment(PUBLIC_SAMPLE_CONFIGURATION.VITE_COVEO_PLATFORM_ENVIRONMENT),
  };
}

function getProxyTargets(mode: string) {
  const env = loadEnv(mode, process.cwd(), '');
  const {organizationId, environment} = resolveConfiguredOrganization(env);

  return resolveProxyTargets(organizationId, env.VITE_COVEO_ENDPOINT?.trim(), environment);
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useProxy = parseBoolean(env.VITE_COVEO_USE_VITE_PROXY) ?? true;
  const targets = getProxyTargets(mode);
  const {organizationId: orgId} = resolveConfiguredOrganization(env);
  const agentRuntimeHeaders = resolveAgentRuntimeHeaders(
    env.VITE_COVEO_AGENT_RUNTIME_NAME,
    env.VITE_COVEO_AGENT_RUNTIME_QUALIFIER
  );

  return {
    plugins: [react()],
    server: {
      open: true,
      ...(useProxy && targets
        ? {
            proxy: {
              [`/api/preview/organizations/${orgId}/agents/commerce/agui`]: {
                target: targets.agentGateway,
                changeOrigin: true,
                secure: true,
                ...(agentRuntimeHeaders ? {headers: agentRuntimeHeaders} : {}),
              },
              '/rest': {
                target: targets.platform,
                changeOrigin: true,
                secure: true,
              },
            },
          }
        : {}),
    },
  };
});
