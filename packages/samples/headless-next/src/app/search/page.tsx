import {ClientSearchEngineProvider} from '@/context/engine';
import {executeFirstSearch} from '@/engine.server';
import {ResultList} from '@/search/result-list';
import {SearchBox} from '@/search/search-box';
import {
  SearchEngineOptions,
  buildResultList,
  buildSearchBox,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Search page',
};

const engineOptions: SearchEngineOptions = {
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
};

const SearchPage = async () => {
  const engine = buildSearchEngine(engineOptions);
  const initialSearchBox = buildSearchBox(engine);
  const initialResultList = buildResultList(engine);
  await executeFirstSearch(engine);

  return (
    <ClientSearchEngineProvider
      options={{...engineOptions, preloadedState: engine.state}}
    >
      <h1>Search page</h1>
      <SearchBox initialState={initialSearchBox.state} />
      <ResultList initialState={initialResultList.state} />
    </ClientSearchEngineProvider>
  );
};

export default SearchPage;
