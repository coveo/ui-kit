/**
 * Return a static sample configuration with pre-configured value for the sample organization.
 */
global with sharing class SampleTokenProvider implements ITokenProvider {
    /**
     * @see `ITokenProvider.getHeadlessConfiguration`.
     */ 
    public static String getHeadlessConfiguration() {
        Map<String, String> headlessConfiguration = new Map<String,String>();
        headlessConfiguration.put('organizationId', 'searchuisamples');
        headlessConfiguration.put('accessToken','xx564559b1-0045-48e1-953c-3addd1ee4457');
        headlessConfiguration.put('platformUrl', 'https://platform.cloud.coveo.com');
        return JSON.serialize(headlessConfiguration);
    }
}