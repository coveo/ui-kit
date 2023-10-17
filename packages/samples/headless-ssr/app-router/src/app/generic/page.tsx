import {fetchStaticState} from '@/src/app/generic/common/engine';
import SearchPage from '@/src/app/generic/components/search-page';
import {
  CoveoNextJsSearchParametersSerializer,
  NextJSServerSideSearchParams,
} from '@/src/common/search-parameters-serializer';

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
  return <SearchPage staticState={staticState}></SearchPage>;
}

// A page with search parameters cannot be statically rendered, since its rendered state should look different based on the current search parameters.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
export const dynamic = 'force-dynamic';
