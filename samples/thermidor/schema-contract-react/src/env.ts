const requiredKeys = [
  'VITE_COVEO_ORGANIZATION_ID',
  'VITE_COVEO_ACCESS_TOKEN',
  'VITE_COVEO_TRACKING_ID',
  'VITE_COVEO_LANGUAGE',
  'VITE_COVEO_COUNTRY',
  'VITE_COVEO_CURRENCY',
] as const;

function required(key: (typeof requiredKeys)[number]): string {
  const value = import.meta.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getSampleConfiguration() {
  return {
    organizationId: required('VITE_COVEO_ORGANIZATION_ID'),
    accessToken: required('VITE_COVEO_ACCESS_TOKEN'),
    trackingId: required('VITE_COVEO_TRACKING_ID'),
    language: required('VITE_COVEO_LANGUAGE'),
    country: required('VITE_COVEO_COUNTRY'),
    currency: required('VITE_COVEO_CURRENCY'),
    endpoint: import.meta.env.DEV
      ? window.location.origin
      : import.meta.env.VITE_COVEO_ENDPOINT?.trim(),
  };
}
