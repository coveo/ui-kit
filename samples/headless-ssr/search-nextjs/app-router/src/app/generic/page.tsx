import {buildSSRSearchParameterSerializer} from '@coveo/headless/ssr';
import {headers} from 'next/headers';
import SearchPage from '@/common/components/generic/search-page';
import {
  fetchStaticState,
  setNavigatorContextProvider,
} from '@/common/lib/generic/engine';
import {NextJsAppRouterNavigatorContext} from '../../navigatorContextProvider';

/**
 * This file defines a Search component that uses the Coveo Headless library to manage its state.
 *
 * The Search function is the entry point for server-side rendering (SSR). It uses the `buildSearchParameterSerializer` util from the Coveo Headless
 * library to serialize the URL search parameters into a string, which is then used by the [UrlManager](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.UrlManager.html) controller.
 *
 * To synchronize search parameters with the URL with more control on the serialization, you can use the [SearchParameterManager](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchParameterManager.html) controller. For the sake of brevity, this sample uses the UrlManager controller.
 *
 * The context values are hard-coded to represent a specific user segment (age group 30-45 with a main interest in sports) as the initial context.
 * These values will be added to the payload of the search request when the search page is rendered.
 */
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}) {
  // Convert URL search parameters into a format that Coveo's search engine can understand.
  const {toSearchParameters} = buildSSRSearchParameterSerializer();
  const searchParameters = toSearchParameters(await searchParams);

  // Defines hard-coded context values to simulate user-specific information.
  const contextValues = {
    ageGroup: '30-45',
    mainInterest: 'sports',
  };

  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsAppRouterNavigatorContext(await headers());

  setNavigatorContextProvider(() => navigatorContext);

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await fetchStaticState({
    controllers: {
      context: {
        initialState: {
          values: contextValues,
        },
      },
      searchParameterManager: {
        initialState: {parameters: searchParameters},
      },
    },
  });
  return (
    <SearchPage
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    ></SearchPage>
  );
}

// A page with search parameters cannot be statically rendered, since its rendered state should look different based on the current search parameters.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
export const dynamic = 'force-dynamic';
