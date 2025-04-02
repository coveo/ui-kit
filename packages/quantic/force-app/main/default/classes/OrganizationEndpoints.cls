public with sharing class OrganizationEndpoints {
  public static Map<String, String> getOrganizationEndpoints(String orgId) {
    return getOrganizationEndpoints(orgId, 'prod');
  }

  public static Map<String, String> getOrganizationEndpoints(
    String orgId,
    String env
  ) {
    String envSuffix = env == 'prod' ? '' : env;

    String platform = 'https://' + orgId + '.org' + envSuffix + '.coveo.com';
    String analytics =
      'https://' +
      orgId +
      'analytics.org' +
      envSuffix +
      '.coveo.com';
    String search = platform + '/rest/search/v2';
    String admin = 'https://' + orgId + 'admin.org' + envSuffix + '.coveo.com';

    return new Map<String, String>{
      'platform' => platform,
      'analytics' => analytics,
      'search' => search,
      'admin' => admin
    };
  }
}
