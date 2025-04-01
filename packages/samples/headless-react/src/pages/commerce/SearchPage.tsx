import {
  buildCommerceEngine,
  buildSearch,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {useMemo} from 'react';
import {Search} from '../../components/commerce/search.fn';
import {AppContext} from '../../context/engine';
import {Section} from '../../layout/section';

export function SearchPage() {
  const engine = useMemo(
    () =>
      buildCommerceEngine({
        configuration: getSampleCommerceEngineConfiguration(),
      }),
    []
  );

  const search = buildSearch(engine);

  return (
    <AppContext.Provider value={{commerceEngine: engine}}>
      <Section title="search">
        <Search controller={search} />
      </Section>
    </AppContext.Provider>
  );
}
