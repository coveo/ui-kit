import SearchPage from '@/common/components/generic/search-page';
import {fetchStaticState} from '@/common/lib/generic/engine';

// Entry point SSR function
export default async function Search() {
  // TODO: Enable after URL management investigation https://coveord.atlassian.net/browse/KIT-2735
  // const {coveoSearchParameters} =
  //   CoveoNextJsSearchParametersSerializer.fromServerSideUrlSearchParams(
  //     url.searchParams
  //   );
  const coveoSearchParameters = {};
  const contextValues = {
    ageGroup: '30-45',
    mainInterest: 'sports',
  };
  const staticState = await fetchStaticState({
    controllers: {
      context: {
        initialState: {
          values: contextValues,
        },
      },
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
