/**
 * Angular CLI dev server proxy configuration.
 *
 * Routes:
 *  - /rest/organizations/{orgId}/commerce/unstable/agentic → admin endpoint
 *  - /rest/** → platform endpoint
 *
 * Reads configuration from .env file (same one used by the app build).
 * OS environment variables take precedence over .env values.
 * Set COVEO_USE_MOCK=true to route all requests to the local mock-converse-api.
 */
const {readFileSync} = require('node:fs');
const {resolve} = require('node:path');

function loadEnvFile() {
  try {
    const content = readFileSync(resolve(__dirname, '.env'), 'utf-8');
    const vars = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
    return vars;
  } catch {
    return {};
  }
}

const dotenv = loadEnvFile();
const env = (key) => process.env[key]?.trim() || dotenv[key] || '';

function resolveEnvironment(value) {
  return ['prod', 'dev', 'stg', 'hipaa'].includes(value) ? value : 'prod';
}

function getOrganizationAdminEndpoint(organizationId, environment) {
  const environmentSuffix = environment === 'prod' ? '' : environment;
  return `https://${organizationId}.admin.org${environmentSuffix}.coveo.com`;
}

function getOrganizationPlatformEndpoint(organizationId, environment) {
  const environmentSuffix = environment === 'prod' ? '' : environment;
  return `https://${organizationId}.org${environmentSuffix}.coveo.com`;
}

const MOCK_CONVERSE_API_URL = 'http://localhost:3456';

function buildProxyConfig() {
  const organizationId = env('COVEO_ORGANIZATION_ID') || 'barcasportsmcy01fvu';
  const useMock = env('COVEO_USE_MOCK').toLowerCase() === 'true';

  if (useMock) {
    return {
      '/rest': {
        target: MOCK_CONVERSE_API_URL,
        secure: false,
        changeOrigin: true,
      },
    };
  }

  const environment = resolveEnvironment(env('COVEO_PLATFORM_ENVIRONMENT') || 'prod');
  const endpointOverride = env('COVEO_ENDPOINT');

  const adminTarget = endpointOverride
    ? endpointOverride
    : getOrganizationAdminEndpoint(organizationId, environment);
  const platformTarget = getOrganizationPlatformEndpoint(organizationId, environment);

  return {
    [`/rest/organizations/${organizationId}/commerce/unstable/agentic`]: {
      target: adminTarget,
      secure: true,
      changeOrigin: true,
    },
    '/rest': {
      target: platformTarget,
      secure: true,
      changeOrigin: true,
    },
  };
}

module.exports = buildProxyConfig();
