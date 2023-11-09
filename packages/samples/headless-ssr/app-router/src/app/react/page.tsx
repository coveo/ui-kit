import {NextJSServerSideSearchParams} from '@/common/components/common/search-parameters-serializer';
import {AuthorFacet} from '@/common/components/react/facets';
import ResultList from '@/common/components/react/result-list';
import SearchBox from '@/common/components/react/search-box';
import {SearchPageProvider} from '@/common/components/react/search-page';
import UrlManager from '@/common/components/react/url-manager';
import {fetchStaticState} from '@/common/lib/react/engine';
import {buildSearchParameterSerializer} from '@coveo/headless';

// Entry point SSR function
export default async function Search(url: {
  searchParams: NextJSServerSideSearchParams;
}) {
  const fragment = buildSearchParameterSerializer().serialize(url.searchParams);

  const staticState = await fetchStaticState({
    controllers: {
      urlManager: {
        initialState: {fragment},
      },
    },
  });

  return (
    <SearchPageProvider staticState={staticState}>
      <UrlManager />
      <SearchBox />
      <ResultList />
      <AuthorFacet />
    </SearchPageProvider>
  );
}

// A page with search parameters cannot be statically rendered, since its rendered state should look different based on the current search parameters.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
export const dynamic = 'force-dynamic';
