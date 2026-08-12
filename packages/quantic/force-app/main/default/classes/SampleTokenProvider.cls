/**
 * Return a static sample configuration with pre-configured value for the sample organization.
 */
global with sharing class SampleTokenProvider implements ITokenProvider {
  /**
   * @see `ITokenProvider.getHeadlessConfiguration`.
   */
  public static String getHeadlessConfiguration() {
    Map<String, String> headlessConfiguration = new Map<String, String>();
    headlessConfiguration.put('organizationId', 'searchuisamples');
    headlessConfiguration.put(
      'accessToken',
      // This API key is intentionally public — it belongs to a sample organization used for samples/docs.
      // Name: Quantic__sampleTokenProvider_key_dnd - Anonymous Search key.
      'xxb9c21134-8dad-4d53-8a5e-855bacddba8f'
    );
    return JSON.serialize(headlessConfiguration);
  }
}
