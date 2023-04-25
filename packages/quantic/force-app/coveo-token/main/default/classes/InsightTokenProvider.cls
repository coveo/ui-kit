global with sharing class InsightTokenProvider implements ITokenProvider {
  /**
   * Calls the Coveo for Salesforce package to retrieve information about the linked organization and to get an Insight platform token.
   * Note: To use the InsightTokenProvider class, Coveo for Salesforce must be installed and configured in your environment.
   * For more information, @see https://docs.coveo.com/en/1158/coveo-for-salesforce/getting-started-with-coveo-for-salesforce.
   */
  @AuraEnabled(continuation=true cacheable=false)
  global static String getHeadlessConfiguration() {
    Map<String, Object> coveoEndpointData = CoveoV2.Globals.getEndpointData();
    String accessToken = CoveoV2.Globals.generatePlatformToken();

    Map<String, String> headlessConfiguration = new Map<String, String>();
    headlessConfiguration.put(
      'organizationId',
      (String) coveoEndpointData.get('organization')
    );
    headlessConfiguration.put('accessToken', accessToken);
    headlessConfiguration.put(
      'platformUrl',
      (String) coveoEndpointData.get('clientUri')
    );
    return JSON.serialize(headlessConfiguration);
  }

  public static List<PlatformToken.TokenPrivilege> buildHIPTokenPrivileges() {
    List<PlatformToken.TokenPrivilege> privileges = new List<PlatformToken.TokenPrivilege>();
    privileges.add(
      new PlatformToken.TokenPrivilege(
        PlatformToken.OWNER_CUSTOMER_SERVICE,
        PlatformToken.DOMAIN_CUSTOMER_SERVICE_INSIGHT_PANEL_INTERFACE,
        PlatformToken.TYPE_VIEW
      )
    );
    privileges.add(
      new PlatformToken.TokenPrivilege(
        PlatformToken.OWNER_USAGE_ANALYTICS,
        PlatformToken.DOMAIN_ANALYTICS_ANALYTICS_DATA,
        PlatformToken.TYPE_EDIT
      )
    );
    privileges.add(
      new PlatformToken.TokenPrivilege(
        PlatformToken.OWNER_CUSTOMER_SERVICE,
        PlatformToken.DOMAIN_CUSTOMER_SERVICE_INSIGHT_PANEL_DOCUMENTS,
        PlatformToken.TYPE_VIEW
      )
    );
    return privileges;
  }
}
