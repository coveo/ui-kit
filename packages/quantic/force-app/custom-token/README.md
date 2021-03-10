# Custom Token Provider

The Custom Token Provider is an example package that demonstrates how to generate a Search Token from an API Key using Coveo API.

It uses two components to do so:

- A [Custom Settings](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_customsettings.htm), to store the information such as the organization ID or the API Key<sup>1</sup>.

- An Apex Class implementing the `ITokenProvider` interface defined in [force-app/main/default/classes/ITokenProvider.cls](../main/default/default/classes/ITokenProvider.cls).

The CustomTokenProvider Apex Class uses the Coveo API to generate a search token. For more information, you can check the [documentation](https://docs.coveo.com/en/56/) or the [swagger](https://platform.cloud.coveo.com/docs/?urls.primaryName=Search%20API#/Search%20V2/token) relative to this REST call.


----
Notes:
1. As mentioned in [Salesforce Documentation](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_customsettings.htm), the usage of custom settings for credential storing purposes is only recommended for packaged code. 