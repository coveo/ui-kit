import {buildSamlClient, SamlClientOptions} from '@coveo/auth';
import {buildSearchEngine} from '@coveo/headless';
import {useEffect, useState, PropsWithChildren, useMemo} from 'react';
import {AppContext} from '../context/engine';

export function SamlPage({
  children,
  ...samlClientOptions
}: PropsWithChildren<SamlClientOptions>) {
  const [initialAccessToken, setInitialAccessToken] = useState('');
  const saml = useMemo(
    () => buildSamlClient(samlClientOptions),
    [samlClientOptions]
  );

  useEffect(() => {
    saml.authenticate().then(setInitialAccessToken);
  }, [saml]);

  if (!initialAccessToken) {
    return null;
  }

  const engine = useMemo(
    () =>
      buildSearchEngine({
        configuration: {
          organizationId: samlClientOptions.organizationId,
          accessToken: initialAccessToken,
          renewAccessToken: saml.authenticate,
        },
      }),
    [samlClientOptions.organizationId, saml.authenticate, initialAccessToken]
  );

  return <AppContext.Provider value={{engine}}>{children}</AppContext.Provider>;
}
