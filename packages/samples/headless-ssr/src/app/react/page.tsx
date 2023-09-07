import {fetchInitialState} from '@/src/app/react/common/engine';
import SearchPage from '@/src/app/react/components/search-page';
import {
  CoveoNextJsSearchParametersSerializer,
  NextJSServerSideSearchParams,
} from '../common/search-parameters-serializer';

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
