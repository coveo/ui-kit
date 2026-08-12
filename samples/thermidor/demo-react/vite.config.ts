import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv} from 'vite';

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
  const normalizedOrganizationId = organizationId?.trim();
  const normalizedEndpointOverride = endpointOverride?.trim();

  if (!normalizedOrganizationId) {
    return undefined;
  }

  const platform = getOrganizationPlatformEndpoint(normalizedOrganizationId, environment);

  return {
    agentGateway: normalizedEndpointOverride || platform,
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

function getProxyTargets(env: Record<string, string>) {
  return resolveProxyTargets(
    env.VITE_COVEO_ORGANIZATION_ID,
    env.VITE_COVEO_ENDPOINT,
    resolveEnvironment(env.VITE_COVEO_PLATFORM_ENVIRONMENT)
  );
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useProxy = parseBoolean(env.VITE_COVEO_USE_VITE_PROXY) ?? true;
  const targets = getProxyTargets(env);
  const orgId = env.VITE_COVEO_ORGANIZATION_ID?.trim();
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
