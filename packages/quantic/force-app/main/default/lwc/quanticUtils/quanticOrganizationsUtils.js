/**
 * @typedef {'prod' | 'hipaa' | 'staging' | 'dev'} PlatformEnvironment
 */

/**
 * Returns the unique endpoint(s) for a given organization identifier.
 * @param {string} orgId The organization identifier.
 * @param {PlatformEnvironment} env Optional. The environment (prod, hipaa, staging, dev) that the organization belongs to. Defaults to `prod`.
 * @returns {object} The organization endpoints.
 */
export function getOrganizationEndpoints(orgId, env = 'prod') {
  const envSuffix = env === 'prod' ? '' : env;

  const platform = `https://${orgId}.org${envSuffix}.coveo.com`;
  const analytics = `https://${orgId}.analytics.org${envSuffix}.coveo.com`;
  const search = `${platform}/rest/search/v2`;
  const admin = `https://${orgId}.admin.org${envSuffix}.coveo.com`;

  return {platform, analytics, search, admin};
}
