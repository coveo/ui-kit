import SearchPage from '@/common/components/generic/search-page';
import {fetchStaticState} from '@/common/lib/generic/engine';
import {buildSearchParameterSerializer} from '@coveo/headless';

// Entry point SSR function
export default async function Search(url: {
  searchParams: {[key: string]: string | string[] | undefined};
}) {
  const fragment = buildSearchParameterSerializer().serialize(url.searchParams);
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
      urlManager: {
        initialState: {fragment},
      },
    },
  });
  return <SearchPage staticState={staticState}></SearchPage>;
}

// A page with search parameters cannot be statically rendered, since its rendered state should look different based on the current search parameters.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
export const dynamic = 'force-dynamic';
