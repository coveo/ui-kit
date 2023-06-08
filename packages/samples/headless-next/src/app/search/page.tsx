import {ClientSearchEngineProvider} from '@/context/engine';
import {ResultList} from '@/search/result-list';
import {SearchBox} from '@/search/search-box';
import {executeFirstSearch} from '@/utils/engine';
import {
  SearchEngineOptions,
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
  const prebuiltEngine = buildSearchEngine(engineOptions);
  await executeFirstSearch(prebuiltEngine);

  return (
    <ClientSearchEngineProvider
      options={{...engineOptions, preloadedState: prebuiltEngine.state}}
    >
      <h1>Search page</h1>
      <SearchBox />
      <ResultList />
    </ClientSearchEngineProvider>
  );
};

export default SearchPage;
