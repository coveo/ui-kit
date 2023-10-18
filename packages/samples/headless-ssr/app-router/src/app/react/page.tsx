import {fetchStaticState} from '@/src/app/react/common/engine';
import {SearchPageProvider} from '@/src/app/react/components/search-page';
import {
  CoveoNextJsSearchParametersSerializer,
  NextJSServerSideSearchParams,
} from '../../common/search-parameters-serializer';
import {AuthorFacet} from './components/facets';
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
  const staticState = await fetchStaticState({
    controllers: {
      searchParameters: {
        initialState: {
          parameters: coveoSearchParameters,
        },
      },
    },
  });

  return (
    <SearchPageProvider staticState={staticState}>
      <SearchParameters />
      <SearchBox />
      <ResultList />
      <AuthorFacet />
    </SearchPageProvider>
  );
}

// A page with search parameters cannot be statically rendered, since its rendered state should look different based on the current search parameters.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
export const dynamic = 'force-dynamic';
