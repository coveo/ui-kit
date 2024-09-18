@isTest
private class HeadlessControllerTest {
  static final String sampleHeadlessConfiguration = '{"accessToken":"xx564559b1-0045-48e1-953c-3addd1ee4457","organizationId":"searchuisamples"}';
  @IsTest
  static void shouldReturnStringifiedConfiguration() {
    Test.startTest();
    System.assertEquals(
      sampleHeadlessConfiguration,
      HeadlessController.getHeadlessConfiguration()
    );
    Test.stopTest();
  }
}
