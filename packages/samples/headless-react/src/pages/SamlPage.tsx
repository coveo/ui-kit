import {buildSamlClient, SamlClientOptions} from '@coveo/auth';
import {buildSearchEngine} from '@coveo/headless';
import {useEffect, useState, PropsWithChildren} from 'react';
import {AppContext} from '../context/engine';

export function SamlPage(props: PropsWithChildren<SamlClientOptions>) {
  const [accessToken, setAccessToken] = useState('');
  const saml = buildSamlClient(props);

  useEffect(() => {
    getToken();
  }, []);

  if (!accessToken) {
    return null;
  }

  async function getToken() {
    try {
      const token = await saml.authenticate();
      setAccessToken(token);
    } catch (e) {
      console.error(e);
    }
  }

  const engine = buildSearchEngine({
    configuration: {
      organizationId: props.organizationId,
      accessToken,
      renewAccessToken: saml.authenticate,
    },
  });

  return (
    <AppContext.Provider value={{engine}}>{props.children}</AppContext.Provider>
  );
}
