import {
  buildFacet,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {useEffect} from 'react';
import {
  FacetWithGenericDecorator,
  FacetWithSpecificDecorator,
} from '../components/facet/facet.class.decorator';
import {FacetWithHook} from '../components/facet/facet.fn.hooks';

import {AppContext} from '../context/engine';
import {Section} from '../layout/section';

export function PageWithHooks() {
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });

  const facetController = buildFacet(engine, {options: {field: 'author'}});

  useEffect(() => {
    engine.executeFirstSearch();
  }, []);

  return (
    <AppContext.Provider value={{engine}}>
      <Section title="standalone-search-box">
        <FacetWithHook controller={facetController} />
        <FacetWithSpecificDecorator options={{field: 'source'}} />
        <FacetWithGenericDecorator options={{field: 'objecttype'}} />
      </Section>
    </AppContext.Provider>
  );
}
