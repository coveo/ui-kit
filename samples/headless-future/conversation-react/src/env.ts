const requiredEnvKeys = [
  'VITE_COVEO_ORGANIZATION_ID',
  'VITE_COVEO_ACCESS_TOKEN',
  'VITE_COVEO_TRACKING_ID',
  'VITE_COVEO_LANGUAGE',
  'VITE_COVEO_COUNTRY',
  'VITE_COVEO_CURRENCY',
] as const;

type RequiredEnvKey = (typeof requiredEnvKeys)[number];
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

function getRequiredEnvValue(key: RequiredEnvKey): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function getOptionalEnvValue(key: string): string | undefined {
  const value = import.meta.env[key];
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function resolvePlatformEnvironment(): PlatformEnvironment {
  const candidate = getOptionalEnvValue('VITE_COVEO_PLATFORM_ENVIRONMENT');
  if (
    candidate === 'prod' ||
    candidate === 'dev' ||
    candidate === 'stg' ||
    candidate === 'hipaa'
  ) {
    return candidate;
  }

  return 'dev';
}

function getOrganizationAdminEndpoint(
  organizationId: string,
  environment: PlatformEnvironment
): string {
  const environmentSuffix = environment === 'prod' ? '' : environment;
  return `https://${organizationId}.admin.org${environmentSuffix}.coveo.com`;
}

function shouldUseViteProxy() {
  const configured = parseBoolean(
    getOptionalEnvValue('VITE_COVEO_USE_VITE_PROXY')
  );

  if (configured !== undefined) {
    return configured;
  }

  return import.meta.env.DEV;
}

export function getSampleConfiguration() {
  const organizationId = getRequiredEnvValue('VITE_COVEO_ORGANIZATION_ID');
  const endpointOverride = getOptionalEnvValue('VITE_COVEO_ENDPOINT');
  const environment = resolvePlatformEnvironment();
  const endpointFromEnvironment = getOrganizationAdminEndpoint(
    organizationId,
    environment
  );

  const endpoint = shouldUseViteProxy()
    ? window.location.origin
    : (endpointOverride ?? endpointFromEnvironment);

  return {
    organizationId,
    accessToken: getRequiredEnvValue('VITE_COVEO_ACCESS_TOKEN'),
    trackingId: getRequiredEnvValue('VITE_COVEO_TRACKING_ID'),
    language: getRequiredEnvValue('VITE_COVEO_LANGUAGE'),
    country: getRequiredEnvValue('VITE_COVEO_COUNTRY'),
    currency: getRequiredEnvValue('VITE_COVEO_CURRENCY'),
    endpoint,
  };
}
