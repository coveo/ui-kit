export function getOrganizationEndpoints(orgId, env = 'prod') {
  const envSuffix = env === 'prod' ? '' : env;

  const platform = `https://${orgId}.org${envSuffix}.coveo.com`;
  const analytics = `https://${orgId}.analytics.org${envSuffix}.coveo.com`;
  const search = `${platform}/rest/search/v2`;
  const admin = `https://${orgId}.admin.org${envSuffix}.coveo.com`;

  return {platform, analytics, search, admin};
}
