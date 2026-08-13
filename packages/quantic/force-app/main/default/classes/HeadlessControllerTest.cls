@isTest
private class HeadlessControllerTest {
  // This API key is intentionally public — it belongs to a sample organization used for samples/docs.
  static final String sampleHeadlessConfiguration = '{"accessToken":"xxb9c21134-8dad-4d53-8a5e-855bacddba8f","organizationId":"searchuisamples"}';
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
