import {Metadata} from 'next';
import {executeOnce} from '@/common/engine-definition';
import {SearchProvider} from '@/context/engine';
import {AuthorFacet} from '@/search/facets';
import {ResultList} from '@/search/result-list';
import {SearchBox} from '@/search/search-box';
import {SearchParametersSynchronizer} from '@/search/search-parameters-synchronizer';
import {SearchParameterSerializer} from '@/utils/search-parameter-serializer';
import {NextPageDefinition} from '@/utils/types';

export const metadata: Metadata = {
  title: 'Search page',
};
// SearchParameterSerializer.fromNextSearchParams(
//   url.searchParams
// ).parameters
const SearchPage: NextPageDefinition = async (url) => {
  const {parameters} = SearchParameterSerializer.fromNextSearchParams(
    url.searchParams
  );
  const snapshot = await executeOnce({
    controllers: {
      searchParametersManager: {
        initialParameters: parameters,
      },
    },
  });

  return (
    <SearchProvider
      searchFulfilledAction={snapshot.searchFulfilledAction}
      controllers={snapshot.controllers}
      parameters={parameters}
    >
      <h1>Search page</h1>
      <SearchParametersSynchronizer />
      <SearchBox />
      <ResultList />
      <AuthorFacet />
    </SearchProvider>
  );
};

export default SearchPage;
