import {buildSamlClient, SamlClientOptions} from '@coveo/auth';
import {buildSearchEngine} from '@coveo/headless';
import {useEffect, useState, PropsWithChildren, useMemo} from 'react';
import {AppContext} from '../context/engine';

export function SamlPage({
  children,
  ...samlClientOptions
}: PropsWithChildren<SamlClientOptions>) {
  const [initialAccessToken, setInitialAccessToken] = useState('');
  const samlClient = useMemo(
    () => buildSamlClient(samlClientOptions),
    [samlClientOptions]
  );

  useEffect(() => {
    samlClient.authenticate().then(setInitialAccessToken);
  }, [samlClient]);

  if (!initialAccessToken) {
    return null;
  }

  const engine = useMemo(
    () =>
      buildSearchEngine({
        configuration: {
          organizationId: samlClientOptions.organizationId,
          accessToken: initialAccessToken,
          renewAccessToken: samlClient.authenticate,
        },
      }),
    [
      samlClientOptions.organizationId,
      samlClient.authenticate,
      initialAccessToken,
    ]
  );

  return <AppContext.Provider value={{engine}}>{children}</AppContext.Provider>;
}
