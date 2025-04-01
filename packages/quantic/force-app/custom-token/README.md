# Custom Token Provider

The Custom Token Provider is a sample package that can be used to demonstrate how to generate a search token from an API key using the Coveo Search API.

It uses the following components:

- A [Custom Settings](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_customsettings.htm) to store the information such as the organization ID or the API Key<sup>1</sup>.

- An Apex Class that implements the `ITokenProvider` interface defined in [force-app/main/default/classes/ITokenProvider.cls](../main/default/default/classes/ITokenProvider.cls).

The CustomTokenProvider Apex Class uses the Coveo API to generate a search token. For more information, see [Search Token authentication](https://docs.coveo.com/en/56/) or the [Swagger documentation](https://platform.cloud.coveo.com/docs/?urls.primaryName=Search%20API#/Search%20V2/token) for this REST call.

---

Notes:

1. As mentioned in the [Salesforce documentation](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_customsettings.htm), the usage of custom settings for credential storing purposes is only recommended for packaged code.
