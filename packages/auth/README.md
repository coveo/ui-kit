[![npm version](https://badge.fury.io/js/@coveo%2Fauth.svg)](https://badge.fury.io/js/@coveo%2Fauth)

# @coveo/auth

Functions to help authenticate with the Coveo platform.

## Install

```
npm i @coveo/auth
```

## SAML

1. Configure a [SAML authentication provider](https://docs.coveo.com/en/91/#creating-a-search-api-saml-authentication-provider) on your organization.

2. Inside your web application, instantiate the SAML client in this package.

### Example

```
import {buildSamlClient} from '@coveo/auth`;

const organizationId = '<organization id>';
const provider = '<configured SAML auth provider name>';

async function main() {
  const saml = buildSamlClient({organizationId, provider});
  const accessToken = await saml.authenticate();
  console.log(accessToken);
}

main();
```

### Example with `@coveo/headless`

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

### Example with `@coveo/headless` and `React`

- Code example [available here](../samples/headless-react/src/pages/SamlPage.tsx).

## Reference

### `SamlClientOptions`

- `organizationId: string`

  The unique identifier of the target Coveo Cloud organization (e.g., `mycoveoorganization8tp8wu3`).

- `provider: string`

  The [SAML authentication provider](https://docs.coveo.com/en/91/#creating-a-search-api-saml-authentication-provider) name (e.g., `oktaA323aab78b9f1-45b5-a095-a1f0fa09ddd5`).

- `platformOrigin?: string`

  The Coveo origin to authenticate through.

  Default value is `https://platform.cloud.coveo.com`.
