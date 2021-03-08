global interface ITokenProvider {
    /**
     * Get the configuration object (serialized) for the initialization of Coveo Headless.
     * @return {String} A serialized object containing the following keys:
     *                      - `platformUrl`: the endpoint to contact Coveo.
     *                      - `accessToken`: a search token (see https://docs.coveo.com/en/56/build-a-search-ui/search-token-authentication).
     *                      - `organizationId`: the ID of the organization to query (see https://docs.coveo.com/en/148/manage-an-organization/retrieve-the-organization-id).
     */
    String getHeadlessConfiguration();
}