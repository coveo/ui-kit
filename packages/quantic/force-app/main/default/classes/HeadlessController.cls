/**
 * Simple Apex Controller to fetch data for Headless initialization.
 */
global with sharing class HeadlessController {
    /**
     * Get the configuration object (serialized) for the initialization of Coveo Headless through a class implementing `ITokenProvider`.
     * @return {String} A serialized object containing the following keys:
     *                      - `platformUrl`: the endpoint to contact Coveo.
     *                      - `accessToken`: a search token (see https://docs.coveo.com/en/56/build-a-search-ui/search-token-authentication).
     *                      - `organizationId`: the ID of the organization to query (see https://docs.coveo.com/en/148/manage-an-organization/retrieve-the-organization-id).\
     */
    @AuraEnabled(cacheable=true)
    public static String getHeadlessConfiguration() {
        /**
         * e.g. To switch to the Coveo Token Provider, you simply need to replace the following line by:
         * `return CoveoTokenProvider.getHeadlessConfiguration();`
         */
        return SampleTokenProvider.getHeadlessConfiguration();
    }
}
