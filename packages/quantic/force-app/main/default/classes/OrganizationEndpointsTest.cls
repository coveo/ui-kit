@isTest
public class OrganizationEndpointsTest {
  @isTest
  static void testGetOrganizationEndpointsWithProdEnv() {
    String orgId = 'testOrgId';
    String env = 'prod';

    Map<String, String> endpoints = OrganizationEndpoints.getOrganizationEndpoints(orgId, env);

    String expectedPlatform = 'https://testOrgId.org.coveo.com';
    String expectedAnalytics = 'https://testOrgIdanalytics.org.coveo.com';
    String expectedSearch = expectedPlatform + '/rest/search/v2';
    String expectedAdmin = 'https://testOrgIdadmin.org.coveo.com';

    System.assertEquals(expectedPlatform, endpoints.get('platform'), 'Platform URL mismatch for prod');
    System.assertEquals(expectedAnalytics, endpoints.get('analytics'), 'Analytics URL mismatch for prod');
    System.assertEquals(expectedSearch, endpoints.get('search'), 'Search URL mismatch for prod');
    System.assertEquals(expectedAdmin, endpoints.get('admin'), 'Admin URL mismatch for prod');
  }

  @isTest
  static void testGetOrganizationEndpointsWithNonProdEnv() {
    String orgId = 'testOrgId';
    String env = 'dev';

    Map<String, String> endpoints = OrganizationEndpoints.getOrganizationEndpoints(orgId, env);

    String expectedPlatform = 'https://testOrgId.orgdev.coveo.com';
    String expectedAnalytics = 'https://testOrgIdanalytics.orgdev.coveo.com';
    String expectedSearch = expectedPlatform + '/rest/search/v2';
    String expectedAdmin = 'https://testOrgIdadmin.orgdev.coveo.com';

    System.assertEquals(expectedPlatform, endpoints.get('platform'), 'Platform URL mismatch for dev');
    System.assertEquals(expectedAnalytics, endpoints.get('analytics'), 'Analytics URL mismatch for dev');
    System.assertEquals(expectedSearch, endpoints.get('search'), 'Search URL mismatch for dev');
    System.assertEquals(expectedAdmin, endpoints.get('admin'), 'Admin URL mismatch for dev');
  }

  @isTest
  static void testGetOrganizationEndpointsWithoutEnv() {
    String orgId = 'testOrgId';

    Map<String, String> endpoints = OrganizationEndpoints.getOrganizationEndpoints(orgId);

    String expectedPlatform = 'https://testOrgId.org.coveo.com';
    String expectedAnalytics = 'https://testOrgIdanalytics.org.coveo.com';
    String expectedSearch = expectedPlatform + '/rest/search/v2';
    String expectedAdmin = 'https://testOrgIdadmin.org.coveo.com';

    System.assertEquals(expectedPlatform, endpoints.get('platform'), 'Platform URL mismatch');
    System.assertEquals(expectedAnalytics, endpoints.get('analytics'), 'Analytics URL mismatch');
    System.assertEquals(expectedSearch, endpoints.get('search'), 'Search URL mismatch');
    System.assertEquals(expectedAdmin, endpoints.get('admin'), 'Admin URL mismatch');
  }
}
