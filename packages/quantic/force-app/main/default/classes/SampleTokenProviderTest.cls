@isTest
private class SampleTokenProviderTest {
    static final String sampleHeadlessConfiguration = '{"platformUrl":"https://platform.cloud.coveo.com","accessToken":"xx564559b1-0045-48e1-953c-3addd1ee4457","organizationId":"searchuisamples"}';
    @IsTest
    static void getHeadlessConfiguration(){
        Test.startTest();
        System.assertEquals(sampleHeadlessConfiguration, SampleTokenProvider.getHeadlessConfiguration(), true);
        Test.stopTest();
    }
}