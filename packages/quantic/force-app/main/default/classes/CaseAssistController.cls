/**
 * Simple Apex Controller to fetch data for Headless initialization specific to the Case Assist use case.
 */
global with sharing class CaseAssistController {
  /**
   * Get the configuration object for the initialization of Coveo Headless Case Assist.
   * This uses the sample token with Case Assist permissions.
   * @return {String} A serialized object containing the Case Assist Headless configuration.
   */
  @AuraEnabled(cacheable=true)
  public static String getHeadlessConfiguration() {
    /**
     * e.g. To switch to the Coveo Token Provider, you simply need to replace the following line by:
     * `return CoveoTokenProvider.getHeadlessConfiguration();`
     */
    return SampleCaseAssistTokenProvider.getHeadlessConfiguration();
  }
}
