/**
 * Simple Apex Controller to fetch data for Headless initialization specific to the Recommendations use case.
 */
global with sharing class RecommendationsController {
  /**
   * Get the configuration object (serialized) for the initialization of Coveo Headless.
   * @return {String} A serialized object containing the following keys:
   *    - `accessToken`: an access token (see https://docs.coveo.com/en/123/apis/get-your-coveo-access-token).
   *    - `organizationId`: the ID of the organization to query (see https://docs.coveo.com/en/148/manage-an-organization/retrieve-the-organization-id).
   */
  @AuraEnabled(cacheable=true)
  public static String getHeadlessConfiguration() {
    /**
     * e.g. To switch to the Coveo Token Provider, you simply need to replace the following line by:
     * `return CoveoTokenProvider.getHeadlessConfiguration();`
     */
    return SampleTokenProvider.getHeadlessConfiguration();
  }
}
