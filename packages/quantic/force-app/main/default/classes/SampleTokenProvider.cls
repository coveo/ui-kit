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
        headlessConfiguration.put('accessToken','xx063ae2d5-2810-4f15-ba0c-1fd6a0b90a9a');
        headlessConfiguration.put('platformUrl', 'https://platform.cloud.coveo.com');
        return JSON.serialize(headlessConfiguration);
    }
}