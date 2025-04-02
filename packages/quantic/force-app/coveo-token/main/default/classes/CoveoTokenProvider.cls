global with sharing class CoveoTokenProvider implements ITokenProvider {
  /**
   * Calls the Coveo for Salesforce package to retrieve information about the linked organization and to get a search token.
   * Note: To use the CoveoTokenProvider class, Coveo for Salesforce must be installed and configured in your environment.
   * For more information, @see https://docs.coveo.com/en/1158/coveo-for-salesforce/getting-started-with-coveo-for-salesforce.
   */
  @AuraEnabled(continuation=true cacheable=false)
  global static String getHeadlessConfiguration() {
    Map<String, Object> coveoEndpointData = CoveoV2.Globals.getEndpointData();
    // It's good practice to set a searchHub in the token for secured routing: @see https://docs.coveo.com/en/quantic/latest/usage/safely-set-search-hub/
    String searchToken = CoveoV2.Globals.generateSearchToken(
      new Map<String, Object>{ 'searchHub' => 'example_coveo' }
    );

    Map<String, String> headlessConfiguration = new Map<String, String>();
    headlessConfiguration.put(
      'organizationId',
      (String) coveoEndpointData.get('organization')
    );
    headlessConfiguration.put('accessToken', searchToken);
    return JSON.serialize(headlessConfiguration);
  }
}
