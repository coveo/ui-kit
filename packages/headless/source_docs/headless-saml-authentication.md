---
title: SAML authentication
group: Usage
slug : usage/saml-authentication
---
# Configure SAML authentication
The [Search API](https://docs.coveo.com/en/52/) supports SAML authentication, and the [`@coveo/auth`](https://github.com/coveo/ui-kit/tree/master/packages/auth) package lets you easily enable SAML authentication in a search page built with the [Coveo Headless library](https://docs.coveo.com/en/lcdf0493/).

## Install `@coveo/auth`

Before you can configure SAML with Headless, you must install the `@coveo/auth` package as a dependency.
You can do this with the following npm command:

```bash
npm i @coveo/auth
```

## Configure SAML

First, [Configure a SAML identity provider using the Search API](https://docs.coveo.com/en/91/).
You’ll need it when creating your Headless interface.

## Headless code sample

The code example below is a sample [SAML page built with Headless](https://github.com/coveo/ui-kit/blob/master/samples/headless/search-react/src/pages/SamlPage.tsx) and [React](https://reactjs.org/).

```tsx
import {buildSamlClient, SamlClient, SamlClientOptions} from '@coveo/auth';
import {buildSearchEngine} from '@coveo/headless';
import {
  useState,
  useMemo,
  useRef,
  useEffect,
  PropsWithChildren,
  FunctionComponent,
} from 'react';
import {AppContext} from '../context/engine';

const samlClientOptions: SamlClientOptions = { <1>
  organizationId: '<ORGANIZATION_ID>',
  provider: '<PROVIDER_ID>',
};

export const SamlPage: FunctionComponent<PropsWithChildren> = ({children}) => {
  const [initialAccessToken, setInitialAccessToken] = useState(''); <2>
  const samlClient = useRef<SamlClient | null>(null); <3>
  useEffect(() => { <4>
    if (samlClient.current) {
      return; <5>
    }
    samlClient.current = buildSamlClient(samlClientOptions); <6>
    samlClient.current.authenticate().then(setInitialAccessToken);
  }, []);

  const engine = useMemo( <7>
    () =>
      initialAccessToken && samlClient.current
        ? buildSearchEngine({
            configuration: {
              organizationId: samlClientOptions.organizationId,
              accessToken: initialAccessToken,
              renewAccessToken: samlClient.current.authenticate,
            },
          })
        : null,
    [samlClientOptions, samlClient.current, initialAccessToken]
  );

  if (!engine) {
    return null;
  }

  return <AppContext.Provider value={{engine}}>{children}</AppContext.Provider>; <8>
};
```

1. `SamlClientOptions` is a `@coveo/auth` interface that lets you define the parameters for the organization and the SAML provider.
The organization is identified with the `organizationId` (for example, `myorg1n23b18d5a`), while the `provider` (for example, `mySAMLAuthenticationProvider`) parameter refers to the SAML identity provider that you configured with the Search API.
2. `initialAccessToken` is defined as a [state](https://beta.reactjs.org/learn/state-a-components-memory) of the `SamlPage` component.
It’s initialized as an empty string using the `useState` hook.
`setInitialAccessToken`, its corresponding state setter function, is also defined.
3. `SamlClient` is a `@coveo/auth` interface that is responsible for initiating the SAML flow to resolve a Coveo access token.
The [`useRef`](https://beta.reactjs.org/reference/react/useRef) hook is used here, because the value of `samlClient` isn’t needed for rendering.
4. The [`useEffect`](https://beta.reactjs.org/reference/react/useEffect) hook is used to initialize `samlClient.current`.
5. `SamlClient.authenticate` is not idempotent.
Calling it twice after redirection from the provider, even on different clients, would cause a redirection loop.
6. `buildSamlClient` is a function used to instantiate `SamlClient`.
7. The [`useMemo`](https://beta.reactjs.org/reference/react/useMemo) hook is used to cache values between re-renders.
In this case, `organizationId`, `accessToken`, and `renewAccessToken` are used to configure the [`buildSearchEngine`](https://docs.coveo.com/en/headless/latest/usage#configure-a-headless-engine) function.
8. The [`Context.Provider`](https://reactjs.org/docs/context.html#contextprovider) React component is returned.