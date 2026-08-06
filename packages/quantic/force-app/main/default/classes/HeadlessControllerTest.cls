@isTest
private class HeadlessControllerTest {
  // This API key is intentionally public — it belongs to a sample organization used for samples/docs.
  static final String sampleHeadlessConfiguration = '{"accessToken":"xxb9c21134-8dad-4d53-8a5e-855bacddba8f","organizationId":"searchuisamples"}';
  static final String sampleCaseAssistHeadlessConfiguration = '{"accessToken":"xx564559b1-0045-48e1-953c-3addd1ee4457","organizationId":"searchuisamples"}';
  @IsTest
  static void shouldReturnStringifiedConfiguration() {
    Test.startTest();
    System.assertEquals(
      sampleHeadlessConfiguration,
      HeadlessController.getHeadlessConfiguration()
    );
    Test.stopTest();
  }

  @IsTest
  static void shouldReturnCaseAssistStringifiedConfiguration() {
    Test.startTest();
    System.assertEquals(
      sampleCaseAssistHeadlessConfiguration,
      HeadlessController.getCaseAssistHeadlessConfiguration()
    );
    Test.stopTest();
  }
}
