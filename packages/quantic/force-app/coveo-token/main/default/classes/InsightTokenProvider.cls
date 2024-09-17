global with sharing class InsightTokenProvider implements ITokenProvider {
  public static final String TYPE_VIEW = 'VIEW';
  public static final String TYPE_EDIT = 'EDIT';
  public static final String OWNER_USAGE_ANALYTICS = 'USAGE_ANALYTICS';
  public static final String OWNER_CUSTOMER_SERVICE = 'CUSTOMER_SERVICE';
  public static final String DOMAIN_ANALYTICS_ANALYTICS_DATA = 'ANALYTICS_DATA';
  public static final String DOMAIN_CUSTOMER_SERVICE_INSIGHT_PANEL_INTERFACE = 'INSIGHT_PANEL_INTERFACE';
  public static final String DOMAIN_CUSTOMER_SERVICE_INSIGHT_PANEL_DOCUMENTS = 'INSIGHT_PANEL_DOCUMENTS';

  /**
   * Returns the privileges needed to put in a Platform token in order to use the Hosted Insight Panel feature.
   * The required privileges will be these:
   * UsageAnalytics --> Write (to send events)
   * Insight Panel Interface --> View (to query the configuration of your Insight Panel)
   * Insight Panel Documents --> View (to send a search request)
   * @return A list containing the required privileges.
   */
  private static List<CoveoV2.PlatformToken.TokenPrivilege> buildInsightTokenPrivileges() {
    List<CoveoV2.PlatformToken.TokenPrivilege> privileges = new List<CoveoV2.PlatformToken.TokenPrivilege>();
    privileges.add(
      new CoveoV2.PlatformToken.TokenPrivilege(
        OWNER_CUSTOMER_SERVICE,
        DOMAIN_CUSTOMER_SERVICE_INSIGHT_PANEL_INTERFACE,
        TYPE_VIEW
      )
    );
    privileges.add(
      new CoveoV2.PlatformToken.TokenPrivilege(
        OWNER_USAGE_ANALYTICS,
        DOMAIN_ANALYTICS_ANALYTICS_DATA,
        TYPE_EDIT
      )
    );
    privileges.add(
      new CoveoV2.PlatformToken.TokenPrivilege(
        OWNER_CUSTOMER_SERVICE,
        DOMAIN_CUSTOMER_SERVICE_INSIGHT_PANEL_DOCUMENTS,
        TYPE_VIEW
      )
    );
    return privileges;
  }

  /**
   * Calls the Coveo for Salesforce package to retrieve information about the linked organization and to get an Insight platform token.
   * Note: To use the InsightTokenProvider class, Coveo for Salesforce must be installed and configured in your environment.
   * For more information, @see https://docs.coveo.com/en/1158/coveo-for-salesforce/getting-started-with-coveo-for-salesforce.
   */
  @AuraEnabled(continuation=true cacheable=false)
  global static String getHeadlessConfiguration() {
    Map<String, Object> coveoEndpointData = CoveoV2.Globals.getEndpointData();
    try {
      List<CoveoV2.PlatformToken.TokenPrivilege> tokenPrivileges = buildInsightTokenPrivileges();
      Map<String, Object> platformTokenParams = new Map<String, Object>();
      platformTokenParams.put('privileges', tokenPrivileges);
      String token = CoveoV2.Globals.generatePlatformToken(platformTokenParams);

      Map<String, String> headlessConfiguration = new Map<String, String>();
      headlessConfiguration.put(
        'organizationId',
        (String) coveoEndpointData.get('organization')
      );
      headlessConfiguration.put('accessToken', token);
      return JSON.serialize(headlessConfiguration);
    } catch (Exception ex) {
      return JSON.serialize(
        new Map<string, Object>{
          'errorTitle' => ex.getTypeName(),
          'error' => ex.getMessage()
        }
      );
    }
  }
}
