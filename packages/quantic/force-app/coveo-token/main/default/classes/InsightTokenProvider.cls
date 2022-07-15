global with sharing class InsightTokenProvider implements ITokenProvider {
    /**
     * Calls the Coveo for Salesforce package to retrieve information about the linked organization and to get an Insight platform token.
     * Note: To use the InsightTokenProvider class, Coveo for Salesforce must be installed and configured in your environment.
     * For more information, @see https://docs.coveo.com/en/1158/coveo-for-salesforce/getting-started-with-coveo-for-salesforce.
     */
    @AuraEnabled(continuation=true cacheable=false)
    global static String getHeadlessConfiguration() {
        Map<String, Object> coveoEndpointData = CoveoV2.Globals.getEndpointData();
        String accessToken = CoveoV2.HIPController.getPlatformToken();

        Map<String, String> headlessConfiguration = new Map<String, String>();
        headlessConfiguration.put('organizationId', (String) coveoEndpointData.get('organization'));
        headlessConfiguration.put('accessToken', accessToken);
        headlessConfiguration.put('platformUrl', (String) coveoEndpointData.get('clientUri'));
        return JSON.serialize(headlessConfiguration);
    }
}