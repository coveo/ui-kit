global with sharing class InsightTokenProvider implements IInsightTokenProvider {
  @AuraEnabled
  global static String getHeadlessConfiguration() {
    return getHeadlessConfiguration('');
  }

  /**
   * Calls the Coveo for Salesforce package to retrieve information about the linked organization and to get an Insight platform token.
   * Note: To use the InsightTokenProvider class, Coveo for Salesforce must be installed and configured in your environment.
   * For more information, @see https://docs.coveo.com/en/1158/coveo-for-salesforce/getting-started-with-coveo-for-salesforce.
   */
  @AuraEnabled(continuation=true cacheable=false)
  global static String getHeadlessConfiguration(String recordId) {
    Map<String, Object> coveoEndpointData = CoveoV2.Globals.getEndpointData();
    try {
      List<CoveoV2.PlatformToken.TokenPrivilege> tokenPrivileges;

      if (String.isNotBlank(recordId)) {
        String[] userActionIds = CoveoV2.Globals.getUserActionIds(
          recordId,
          new List<String>{ 'CreatedBy.Email' }
        );
        String userActionTarget = (userActionIds.isEmpty())
          ? null
          : userActionIds[0];
        Map<String, Object> tokenPrivilegesParams = (userActionTarget != null)
          ? new Map<String, Object>{ 'userActionTarget' => userActionTarget }
          : null;
        tokenPrivileges = CoveoV2.PlatformToken.buildInsightTokenPrivileges(
          tokenPrivilegesParams
        );
      } else {
        tokenPrivileges = CoveoV2.PlatformToken.buildInsightTokenPrivileges();
      }

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
