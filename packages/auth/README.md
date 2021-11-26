# @coveo/auth

Functions to help authenticate with the Coveo platform.

## Install

```
npm i @coveo/saml
```

## SAML

1. Configure a [SAML authentication provider](https://docs.coveo.com/en/91/#creating-a-search-api-saml-authentication-provider) on your organization.

2. Instantiate the SAML client provided by this package in your web application.

### Sample
```
import {buildSamlClient} from '@coveo/auth`;

const organizationId = '<your organization id>';
const provider = '<your configured SAML provider name>';

async function main() {
  const saml = buildSamlClient({organizationId, provider});
  const accessToken = await saml.authenticate();
  console.log(accessToken);
}

main();
```
### Sample with `@coveo/headless`

```
import {buildSamlClient} from '@coveo/auth`;
import {buildSearchEngine} from '@coveo/headless`;

async function main() {
  const saml = buildSamlClient(...);
  const accessToken = await saml.authenticate();

  const engine = buildSearchEngine({
    configuration: {
      organizationId,
      accessToken,
      renewAccessToken: saml.authenticate,
    },
  });
}

main()
```
React sample [available here](../samples/headless-react/src/pages/SamlPage.tsx).

### `SamlClientOptions`

- `organizationId: string`

  The unique identifier of the target Coveo Cloud organization (e.g., `mycoveoorganizationg8tp8wu3`).

- `provider: string`

  The [SAML authentication provider](https://docs.coveo.com/en/91/#creating-a-search-api-saml-authentication-provider) name (e.g., `oktaA323aab78b9f1-45b5-a095-a1f0fa09ddd5`).

- `platformOrigin?: string`

  The Coveo origin to authenticate through.

  Default value is `https://platform.cloud.coveo.com`.