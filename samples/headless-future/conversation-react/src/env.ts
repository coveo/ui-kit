const requiredEnvKeys = [
  'VITE_COVEO_ORGANIZATION_ID',
  'VITE_COVEO_ACCESS_TOKEN',
  'VITE_COVEO_TRACKING_ID',
  'VITE_COVEO_LANGUAGE',
  'VITE_COVEO_COUNTRY',
  'VITE_COVEO_CURRENCY',
] as const;

type RequiredEnvKey = (typeof requiredEnvKeys)[number];

function getRequiredEnvValue(key: RequiredEnvKey): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getSampleConfiguration() {
  return {
    organizationId: getRequiredEnvValue('VITE_COVEO_ORGANIZATION_ID'),
    accessToken: getRequiredEnvValue('VITE_COVEO_ACCESS_TOKEN'),
    trackingId: getRequiredEnvValue('VITE_COVEO_TRACKING_ID'),
    language: getRequiredEnvValue('VITE_COVEO_LANGUAGE'),
    country: getRequiredEnvValue('VITE_COVEO_COUNTRY'),
    currency: getRequiredEnvValue('VITE_COVEO_CURRENCY'),
  };
}
