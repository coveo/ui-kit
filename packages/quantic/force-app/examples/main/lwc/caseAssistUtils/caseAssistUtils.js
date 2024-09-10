// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';
// @ts-ignore
import {getOrganizationEndpoints} from 'c/organizationUtils';

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
