import {
  FacetProps,
  SearchEngineOptions,
  buildFacet,
  buildSearchBox,
  buildSearchEngine,
  buildSearchParameterManager,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {Metadata} from 'next';
import {ClientSearchEngineProvider} from '@/context/engine';
import {Facet} from '@/search/facet';
import {ResultList} from '@/search/result-list';
import {SearchBox} from '@/search/search-box';
import {SearchParametersSynchronizer} from '@/search/search-parameters-synchronizer';
import {executeFirstSearch} from '@/utils/engine';
import {SearchParameterSerializer} from '@/utils/search-parameter-serializer';
import {NextPageDefinition} from '@/utils/types';

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

const SearchPage: NextPageDefinition = async (url) => {
  const prebuiltEngine = buildSearchEngine(engineOptions);
  buildFacet(prebuiltEngine, authorFacetProps);
  buildSearchBox(prebuiltEngine);
  const {parameters} = SearchParameterSerializer.fromNextSearchParams(
    url.searchParams
  );
  const searchParametersManager = buildSearchParameterManager(prebuiltEngine, {
    initialState: {
      parameters,
    },
  });
  await executeFirstSearch(prebuiltEngine);

  return (
    <ClientSearchEngineProvider
      options={{...engineOptions, preloadedState: prebuiltEngine.state}}
    >
      <h1>Search page</h1>
      <SearchParametersSynchronizer
        initialParameters={searchParametersManager.state.parameters}
      />
      <SearchBox />
      <ResultList />
      <Facet props={authorFacetProps} />
    </ClientSearchEngineProvider>
  );
};

export default SearchPage;
