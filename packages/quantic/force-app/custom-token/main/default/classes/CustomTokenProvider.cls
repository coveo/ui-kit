global with sharing class CustomTokenProvider implements ITokenProvider {
    global with sharing class HttpException extends Exception {}
    global with sharing class InvalidTokenSettingsException extends Exception {}

    private static final String CONTENT_TYPE_APPLICATION_JSON = 'application/json; charset=UTF-8';
    private static final String TOKEN_PATH = '/rest/search/v2/token';

    private static Boolean isValidURL(String candidateURL) {
        if(String.isEmpty(candidateURL)) {
            return false;
        }
        try {
            new Url(candidateURL);
        } catch (Exception e) {
            return false;
        }
        return true;
    }

    private static Map<String,String> getCurrentUserIdentity() {
        Map<String,String> currentUserInfo = new Map<String,String>();
        currentUserInfo.put('name', UserInfo.getUserEmail());
        currentUserInfo.put('type', 'User');
        currentUserInfo.put('provider', 'Email Security Provider');
        return currentUserInfo;
    }

    /**
     * Return the array of user identities to be concerned by the token.
     * See https://docs.coveo.com/en/56/build-a-search-ui/search-token-authentication#userids-array-of-restuserid-required.
     */
    private static List<Map<String,String>> getUserIdentities() {
        List<Map<String,String>> userIdentities = new List<Map<String,String>>();
        userIdentities.add(CustomTokenProvider.getCurrentUserIdentity());
        return userIdentities;
    }

    private static Boolean isTokenSettingInvalid(TokenSettings__c settings) {
        return  String.isEmpty(settings.OrganizationId__c) ||
                String.isEmpty(settings.ApiKey__c);
    }

    private static Boolean isASuccessResponse(HTTPResponse response) {
        Integer responseStatusCode = response.getStatusCode();
        return (responseStatusCode >= 200 && responseStatusCode < 300);
    }

    private static String extractTokenFromResponse(HTTPResponse response) {
        Map<String,Object> responseAsMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
        return (String) responseAsMap.get('token');
    }

    /**
     * Build a HttpRequest to get a search token from a TokenSettings__c object.
     * @param {settings} the settings to use.
     */
    private static HttpRequest buildHttpRequest(TokenSettings__c settings) {
        HttpRequest tokenRequest = new HttpRequest();
        tokenRequest.setEndpoint(settings.PlatformUrl__c + TOKEN_PATH + '?organizationId=' + settings.OrganizationId__c);
        tokenRequest.setMethod('POST');
        tokenRequest.setHeader('Accept', CONTENT_TYPE_APPLICATION_JSON);
        tokenRequest.setHeader('Content-Type', CONTENT_TYPE_APPLICATION_JSON);
        tokenRequest.setHeader('Authorization', 'Bearer ' + settings.ApiKey__c);

        Map<String,Object> requestBody = new Map<String, Object>();
        requestBody.put('userIds', CustomTokenProvider.getUserIdentities());
        String requestBodySerialized = JSON.serialize(requestBody);
        tokenRequest.setBody(requestBodySerialized);
        tokenRequest.setHeader('Content-Length', String.valueOf(requestBodySerialized.length()));

        return tokenRequest;
    }

    /**
     * Get a search token from Coveo Platform based on the setting and the current user identity.
     * @param {settings} the settings to use.
     */
    private static String getToken(TokenSettings__c settings) {
        HttpRequest tokenRequest = CustomTokenProvider.buildHttpRequest(settings);

        HTTPResponse tokenResponse = (new Http()).send(tokenRequest);
        if(!CustomTokenProvider.isASuccessResponse(tokenResponse)) {
            throw new HttpException(tokenResponse.getBody());
        }

        return CustomTokenProvider.extractTokenFromResponse(tokenResponse);
    }

    /**
     * Get a serialized object representing a HeadlessConfiguration, based on the TokenSettings__c
     * of the organization and the user identity of the user that called the method/loaded the page.
     */
    @AuraEnabled(continuation=true cacheable=false)
    global static String getHeadlessConfiguration() {
        TokenSettings__c settings = TokenSettings__c.getOrgDefaults();

        if (CustomTokenProvider.isTokenSettingInvalid(settings)) {
            throw new InvalidTokenSettingsException('TokenSettings invalid. Defaulting to sample organization settings.');
        }

        Map<String, String> headlessConfiguration = new Map<String, String>();
        headlessConfiguration.put('organizationId', settings.OrganizationId__c);
        headlessConfiguration.put('accessToken', CustomTokenProvider.getToken(settings););
        headlessConfiguration.put('platformUrl', settings.PlatformUrl__c);
        return JSON.serialize(headlessConfiguration);
    }
}