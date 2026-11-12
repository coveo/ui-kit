import {buildSSRSearchParameterSerializer} from '@coveo/headless-react/ssr-next';
import AuthorFacet from '@/components/react/author-facet';
import {HydrationMetadata} from '@/components/react/hydration-metadata';
import ParameterManager from '@/components/react/parameter-manager';
import {SearchProvider} from '@/components/react/providers';
import ResultList from '@/components/react/result-list';
import SearchBox from '@/components/react/search-box';
import Tabs from '@/components/react/tabs';
import {getNavigatorContext} from '@/lib/navigator-context';
import {searchEngineDefinition} from '@/lib/react/engine';
import {contextValues} from '@/lib/search-engine-config';

/**
 * The React example: this server component fetches the static state, and `SearchProvider` renders it,
 * hydrates it in the browser and serves the controller hooks.
 */
export default async function ReactSearch({
  searchParams,
}: {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}) {
  const {toSearchParameters} = buildSSRSearchParameterSerializer();

  const staticState = await searchEngineDefinition.fetchStaticState({
    navigatorContext: await getNavigatorContext(),
    searchParams: toSearchParameters(await searchParams),
    controllers: {context: {initialState: {values: contextValues}}},
  });

  return (
    <SearchProvider staticState={staticState}>
      <ParameterManager />
      <SearchBox />
      <Tabs />
      <AuthorFacet />
      <ResultList />
      <HydrationMetadata />
    </SearchProvider>
  );
}

// The rendered state depends on the search parameters of the URL, so the page cannot be static.
export const dynamic = 'force-dynamic';
