import {fetchInitialState} from '@/src/common/engine';
import {
  CoveoNextJsSearchParametersSerializer,
  NextJSServerSideSearchParams,
} from '@/src/common/search-parameters-serializer';
import SearchPage from '@/src/components/search-page';

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
  return <SearchPage ssrState={ssrState}></SearchPage>;
}

export const dynamic = 'force-dynamic';
