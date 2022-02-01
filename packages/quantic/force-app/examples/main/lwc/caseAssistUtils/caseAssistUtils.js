// @ts-ignore
import getHeadlessConfiguration from '@salesforce/apex/HeadlessController.getHeadlessConfiguration';

export async function getCaseAssistId(configName) {
  try {
    let data = await getHeadlessConfiguration();
    data = JSON.parse(data);
    const {accessToken, organizationId, platformUrl} = data;
    const url = `${platformUrl}/rest/organizations/${organizationId}/caseassists`;
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
