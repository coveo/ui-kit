@isTest
private class RecommendationsControllerTest {
  // This is a demo token and it's okay to be public.
  static final String sampleHeadlessConfiguration = '{"accessToken":"xx564559b1-0045-48e1-953c-3addd1ee4457","organizationId":"searchuisamples"}';
  @IsTest
  static void shouldReturnStringifiedConfiguration() {
    Test.startTest();
    System.assertEquals(
      sampleHeadlessConfiguration,
      RecommendationsController.getHeadlessConfiguration()
    );
    Test.stopTest();
  }
}
