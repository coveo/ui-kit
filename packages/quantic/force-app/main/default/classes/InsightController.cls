/**
 * Simple Apex Controller to fetch data for Headless initialization specific to the Insight use case.
 */
global with sharing class InsightController {
  public static String getHeadlessConfiguration() {
    return getHeadlessConfiguration('');
  }

  /**
   * Get the configuration object (serialized) for the initialization of Coveo Headless through a class implementing `ITokenProvider`.
   * @return {String} A serialized object containing the following keys:
   *    - `accessToken`: a platform token (see https://docs.coveo.com/en/n3ge0020/apis/use-platform-token-authentication).
   *    - `organizationId`: the ID of the organization to query (see https://docs.coveo.com/en/148/manage-an-organization/retrieve-the-organization-id).
   */
  @AuraEnabled(cacheable=true)
  public static String getHeadlessConfiguration(String recordId) {
    /**
     * The SampleInsightTokenProvider returns a static sample configuration with
     * hardcoded demo credentials for the Coveo sample organization.
     * To switch to the real Insight Token Provider, replace the following line by:
     * `return InsightTokenProvider.getHeadlessConfiguration(recordId);`
     */
    return SampleInsightTokenProvider.getHeadlessConfiguration(recordId);
  }
}
