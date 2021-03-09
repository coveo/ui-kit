global with sharing class CoveoV2TokenProvider implements ITokenProvider {
    /**
     * Call the CoveoForSalesforce package to ge the information on the organization linked and a search token.
     */
    @AuraEnabled(continuation=true cacheable=false)
    global static String getHeadlessConfiguration() {
        Map<String, Object> coveoV2EndpointData = CoveoV2.Globals.getEndpointData();
        String searchToken = CoveoV2.Globals.generateSearchToken();

        Map<String, String> headlessConfiguration = new Map<String, String>();
        headlessConfiguration.put('organizationId', (String) coveoV2EndpointData.get('organization'));
        headlessConfiguration.put('accessToken', searchToken);
        headlessConfiguration.put('platformUrl', (String) coveoV2EndpointData.get('clientUri'));
        return JSON.serialize(headlessConfiguration);
    }
}