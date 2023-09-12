import {
  NextJSServerSideSearchParams,
  stringifyNextJSSearchParams,
} from '@/src/app/common/search-parameters-serializer';
import {fetchInitialState} from '@/src/app/generic/common/engine';
import SearchPage from '@/src/app/generic/components/search-page';

// Entry point SSR function
export default async function Search(url: {
  searchParams: NextJSServerSideSearchParams;
}) {
  const ssrState = await fetchInitialState({
    controllers: {
      searchParameters: {
        initialState: {
          fragment: stringifyNextJSSearchParams(url.searchParams),
        },
      },
    },
  });
  return <SearchPage ssrState={ssrState}></SearchPage>;
}

// A page with search parameters cannot be statically rendered, since its rendered state should look different based on the current search parameters.
export const dynamic = 'force-dynamic';
