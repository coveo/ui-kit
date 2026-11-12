import {buildSSRSearchParameterSerializer} from '@coveo/headless/ssr-next';
import SearchPage from '@/components/generic/search-page';
import {searchEngineDefinition} from '@/lib/generic/engine';
import {getNavigatorContext} from '@/lib/navigator-context';
import {contextValues} from '@/lib/search-engine-config';

/**
 * The framework-agnostic example: this server component fetches the static state, and `SearchPage`
 * hydrates it in the browser by hand.
 */
export default async function GenericSearch({
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

  return <SearchPage staticState={staticState} />;
}

// The rendered state depends on the search parameters of the URL, so the page cannot be static.
export const dynamic = 'force-dynamic';
