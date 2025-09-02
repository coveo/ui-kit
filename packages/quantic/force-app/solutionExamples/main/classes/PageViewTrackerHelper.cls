public with sharing class PageViewTrackerHelper {
  @AuraEnabled(cacheable=true)
  public static Id getArticleId(String urlName) {
    if (String.isBlank(urlName)) {
      return null;
    }

    Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
    if (!gd.containsKey('Knowledge__kav')) {
      // Knowledge not enabled in this org → gracefully do nothing
      return null;
    }

    String soql =
      'SELECT Id ' +
      'FROM Knowledge__kav ' +
      'WHERE UrlName = :urlName ' +
      '  AND PublishStatus = \'Online\' ' +
      'ORDER BY LastPublishedDate DESC ' +
      'LIMIT 1';
    List<SObject> rows = Database.query(soql, AccessLevel.USER_MODE);
    return rows.isEmpty() ? null : (Id) rows[0].get('Id');
  }
}
