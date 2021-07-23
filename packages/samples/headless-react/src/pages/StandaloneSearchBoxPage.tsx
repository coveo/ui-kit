import {
  buildSearchEngine,
  buildStandaloneSearchBox,
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

  const searchBox = buildStandaloneSearchBox(engine, {
    options: {redirectionUrl: 'https://mywebsite.com/search'},
  });

  return (
    <AppContext.Provider value={{engine}}>
      <Section title="standalone-search-box">
        <StandaloneSearchBox />
        <StandaloneSearchBoxFn controller={searchBox} />
      </Section>
    </AppContext.Provider>
  );
}
