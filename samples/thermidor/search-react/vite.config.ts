import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig, loadEnv} from 'vite';

type PlatformEnvironment = 'prod' | 'dev' | 'stg' | 'hipaa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const headlessFutureRoot = path.resolve(
  __dirname,
  '../../../packages/thermidor'
);
const headlessFutureSourceEntry = path.resolve(
  headlessFutureRoot,
  'src/index.ts'
);

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
  if (
    value === 'prod' ||
    value === 'dev' ||
    value === 'stg' ||
    value === 'hipaa'
  ) {
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

function getProxyTargets(mode: string) {
  const env = loadEnv(mode, process.cwd(), '');
  const organizationId = env.VITE_COVEO_ORGANIZATION_ID?.trim();
  const endpointOverride = env.VITE_COVEO_ENDPOINT?.trim();
  const environment = resolveEnvironment(env.VITE_COVEO_PLATFORM_ENVIRONMENT);

  if (!organizationId) {
    return undefined;
  }

  const platform = endpointOverride
    ? endpointOverride
    : getOrganizationPlatformEndpoint(organizationId, environment);

  return {platform};
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useProxy = parseBoolean(env.VITE_COVEO_USE_VITE_PROXY) ?? true;
  const targets = getProxyTargets(mode);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@coveo/thermidor': headlessFutureSourceEntry,
        '@': headlessFutureRoot,
      },
    },
    server: {
      open: true,
      ...(useProxy && targets
        ? {
            proxy: {
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
