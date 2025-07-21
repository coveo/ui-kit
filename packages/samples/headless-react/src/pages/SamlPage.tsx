import {
  buildSamlClient,
  type SamlClient,
  type SamlClientOptions,
} from '@coveo/auth';
import {buildSearchEngine} from '@coveo/headless';
import {
  type FunctionComponent,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {AppContext} from '../context/engine';

const samlClientOptions: SamlClientOptions = {
  organizationId: '',
  provider: '',
};

export const SamlPage: FunctionComponent<PropsWithChildren> = ({children}) => {
  const [initialAccessToken, setInitialAccessToken] = useState('');
  const samlClient = useRef<SamlClient | null>(null);
  useEffect(() => {
    if (samlClient.current) {
      // `SamlClient.authenticate` is not idempotent. Calling it twice after redirection from the provider, even on different clients, will cause a redirection loop.
      return;
    }
    samlClient.current = buildSamlClient(samlClientOptions);
    samlClient.current.authenticate().then(setInitialAccessToken);
  }, []);

  const engine = useMemo(
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

  return <AppContext.Provider value={{engine}}>{children}</AppContext.Provider>;
};
