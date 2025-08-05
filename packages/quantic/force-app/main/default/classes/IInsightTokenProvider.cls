global interface IInsightTokenProvider {
  /**
   * Get the configuration object (serialized) for the initialization of Coveo Headless.
   * @param {String} recordId – The record ID used to fetch user context or privileges for token generation.
   * @return {String} A serialized object containing the following keys:
   *    - `accessToken`: a search token (see https://docs.coveo.com/en/56/build-a-search-ui/search-token-authentication).
   *    - `organizationId`: the ID of the organization to query (see https://docs.coveo.com/en/148/manage-an-organization/retrieve-the-organization-id).
   */
  String getHeadlessConfiguration(String recordId);
}
