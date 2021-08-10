import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {StandaloneSearchBox} from '../components/standalone-search-box/standalone-search-box.class';
import {StandaloneSearchBox as StandaloneSearchBoxFn} from '../components/standalone-search-box/standalone-search-box.fn';

import {AppContext} from '../context/engine';
import {Section} from '../layout/section';

export function StandaloneSearchBoxPage() {
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });

  return (
    <AppContext.Provider value={{engine}}>
      <Section title="standalone-search-box">
        <StandaloneSearchBox />
        <StandaloneSearchBoxFn id="ssb-1" redirectionUrl="/search-page" />
      </Section>
    </AppContext.Provider>
  );
}
