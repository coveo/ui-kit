import {ClientSearchEngineProvider} from '@/context/engine';
import {Facet} from '@/search/facet';
import {ResultList} from '@/search/result-list';
import {SearchBox} from '@/search/search-box';
import {executeFirstSearch} from '@/utils/engine';
import {
  FacetProps,
  SearchEngineOptions,
  buildFacet,
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

const authorFacetProps: FacetProps = {
  options: {facetId: 'author', field: 'author'},
};

const SearchPage = async () => {
  const prebuiltEngine = buildSearchEngine(engineOptions);
  buildFacet(prebuiltEngine, authorFacetProps);
  await executeFirstSearch(prebuiltEngine);

  return (
    <ClientSearchEngineProvider
      options={{...engineOptions, preloadedState: prebuiltEngine.state}}
    >
      <h1>Search page</h1>
      <SearchBox />
      <ResultList />
      <Facet props={authorFacetProps} />
    </ClientSearchEngineProvider>
  );
};

export default SearchPage;
