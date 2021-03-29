@isTest
private class SampleTokenProviderTest {
    static final String sampleHeadlessConfiguration = '{"platformUrl":"https://platform.cloud.coveo.com","accessToken":"xx063ae2d5-2810-4f15-ba0c-1fd6a0b90a9a","organizationId":"searchuisamples"}';
    @IsTest
    static void shouldReturnStringifiedConfiguration(){
        Test.startTest();
        System.assertEquals(sampleHeadlessConfiguration, SampleTokenProvider.getHeadlessConfiguration());
        Test.stopTest();
    }
}
