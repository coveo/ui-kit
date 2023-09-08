import {fetchInitialState} from '@/src/app/react/common/engine';
import {SearchPageProvider} from '@/src/app/react/components/search-page';
import {
  CoveoNextJsSearchParametersSerializer,
  NextJSServerSideSearchParams,
} from '../common/search-parameters-serializer';
import ResultList from './components/result-list';
import SearchBox from './components/search-box';
import SearchParameters from './components/search-parameters';

// Entry point SSR function
export default async function Search(url: {
  searchParams: NextJSServerSideSearchParams;
}) {
  const {coveoSearchParameters} =
    CoveoNextJsSearchParametersSerializer.fromServerSideUrlSearchParams(
      url.searchParams
    );
  const ssrState = await fetchInitialState({
    controllers: {
      searchParameters: {
        initialState: {
          parameters: coveoSearchParameters,
        },
      },
    },
  });

  return (
    <SearchPageProvider ssrState={ssrState}>
      <SearchParameters />
      <SearchBox />
      <ResultList />
    </SearchPageProvider>
  );
}

// A page with search parameters cannot be statically rendered, since its rendered state should look different based on the current search parameters.
export const dynamic = 'force-dynamic';
