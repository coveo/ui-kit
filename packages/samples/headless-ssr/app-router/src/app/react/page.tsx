import {fetchStaticState} from '@/common/lib/react/engine';
import {SearchPageProvider} from '@/common/components/react/search-page';
import {
  CoveoNextJsSearchParametersSerializer,
  NextJSServerSideSearchParams,
} from '@/common/components/common/search-parameters-serializer';
import ResultList from '@/common/components/react/result-list';
import SearchBox from '@/common/components/react/search-box';
import SearchParameters from '@/common/components/react/search-parameters';
import {AuthorFacet} from '@/common/components/react/facets';

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
