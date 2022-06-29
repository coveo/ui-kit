import {SamlClientOptions} from '@coveo/auth';
import {
  buildSearchEngineWithSamlAuthentication,
  SearchEngine,
} from '@coveo/headless';
import {useEffect, useState, PropsWithChildren} from 'react';
import {AppContext} from '../context/engine';

export function SamlPage(props: PropsWithChildren<SamlClientOptions>) {
  const [engine, setEngine] = useState<SearchEngine | null>(null);

  useEffect(() => {
    getEngine();
  }, []);

  if (!engine) {
    return null;
  }

  async function getEngine() {
    try {
      setEngine(
        await buildSearchEngineWithSamlAuthentication({
          configuration: {
            organizationId: props.organizationId,
            provider: props.provider,
          },
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <AppContext.Provider value={{engine}}>{props.children}</AppContext.Provider>
  );
}
