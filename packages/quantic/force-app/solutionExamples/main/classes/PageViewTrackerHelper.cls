public with sharing class PageViewTrackerHelper {
  @AuraEnabled(cacheable=true)
  public static Id getArticleId(String urlName) {
    return [
      SELECT Id
      FROM Knowledge__kav
      WHERE
        UrlName = :urlName
        AND PublishStatus = 'Online'
      LIMIT 1
    ]
    .Id;
  }
}
