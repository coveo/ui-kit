import {
  CoveoNextJsSearchParametersSerializer,
  NextJSServerSideSearchParams,
} from '@/src/app/common/search-parameters-serializer';
import {
  fetchBuildResult,
  fetchStaticState,
} from '@/src/app/generic/common/engine';
import SearchPage from '@/src/app/generic/components/search-page';

// Entry point SSR function
export default async function Search(url: {
  searchParams: NextJSServerSideSearchParams;
}) {
  const {coveoSearchParameters} =
    CoveoNextJsSearchParametersSerializer.fromServerSideUrlSearchParams(
      url.searchParams
    );
  const staticState = await fetchStaticState({
    buildResult: await fetchBuildResult({
      searchParametersInitialState: {
        parameters: coveoSearchParameters,
      },
    }),
  });
  return <SearchPage staticState={staticState}></SearchPage>;
}

// A page with search parameters cannot be statically rendered, since its rendered state should look different based on the current search parameters.
export const dynamic = 'force-dynamic';
