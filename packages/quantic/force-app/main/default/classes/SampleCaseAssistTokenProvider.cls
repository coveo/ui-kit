/**
 * Return a static sample configuration with pre-configured value for the sample organization (Case Assist use case).
 */
global with sharing class SampleCaseAssistTokenProvider implements ITokenProvider {
  /**
   * @see `ITokenProvider.getHeadlessConfiguration`.
   */
  @AuraEnabled
  global static String getHeadlessConfiguration() {
    Map<String, String> headlessConfiguration = new Map<String, String>();
    headlessConfiguration.put('organizationId', 'searchuisamples');
    headlessConfiguration.put(
      'accessToken',
      // This API key is intentionally public — it belongs to a sample organization used for samples/docs.
      'xx564559b1-0045-48e1-953c-3addd1ee4457'
    );
    return JSON.serialize(headlessConfiguration);
  }
}
