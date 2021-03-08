global with sharing class HeadlessController {
    @AuraEnabled(continuation=true cacheable=false)
    public static String getHeadlessConfiguration() {
        return SampleTokenProvider.getHeadlessConfiguration();
    }
}
