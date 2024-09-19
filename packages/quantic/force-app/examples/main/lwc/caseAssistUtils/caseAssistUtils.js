// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';

export function getOrganizationEndpoints(orgId, env = 'prod') {
  const envSuffix = env === 'prod' ? '' : env;

  const platform = `https://${orgId}.org${envSuffix}.coveo.com`;
  const analytics = `https://${orgId}.analytics.org${envSuffix}.coveo.com`;
  const search = `${platform}/rest/search/v2`;
  const admin = `https://${orgId}.admin.org${envSuffix}.coveo.com`;

  return {platform, analytics, search, admin};
}

export async function getCaseAssistId(configName) {
  try {
    let data = await getHeadlessConfiguration();
    const {accessToken, organizationId} = JSON.parse(data);
    const platform = getOrganizationEndpoints(organizationId).platform;
    const url = `${platform}/rest/organizations/${organizationId}/caseassists`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
    const responseData = await response.json();
    const configuration = responseData.configurations.find(
      (config) => config.name === configName
    );
    return configuration?.id;
  } catch (e) {
    return null;
  }
}
