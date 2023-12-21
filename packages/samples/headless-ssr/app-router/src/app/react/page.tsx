import {CoveoNextJsSearchParametersSerializer} from '@/common/components/common/search-parameters-serializer';
import {AuthorFacet, SourceFacet} from '@/common/components/react/facets';
import ResultList from '@/common/components/react/result-list';
import SearchBox from '@/common/components/react/search-box';
import {SearchPageProvider} from '@/common/components/react/search-page';
import SearchParameterManager from '@/common/components/react/search-parameter-manager';
import {fetchStaticState} from '@/common/lib/react/engine';

/**
 * This file defines a Search component that uses the Coveo Headless library to manage its state.
 *
 * The Search function is the entry point for server-side rendering (SSR). It uses the `buildSearchParameterSerializer` util from the Coveo Headless
 * library to serialize the url search parameters into a string, which is then used by the [SearchParameterManager](https://docs.coveo.com/en/headless/latest/reference/search/controllers/search-parameter-manager) controller.
 *
 * To synchronize search parameters with the URL with more control on the serialization, you can use the [SearchParameterManager](https://docs.coveo.com/en/headless/latest/reference/search/controllers/search-parameter-manager/) controller. For sake of brevity, this sample uses the SearchParameterManager controller.
 *
 * The context values are hard-coded to represent a specific user segment (age group 30-45 with a main interest in sports) as the initial context.
 * These values will be added to the payload of the search request when the search page is rendered.
 */

export default async function Search(url: {
  searchParams: {[key: string]: string | string[] | undefined};
}) {
  // TODO: revisit this static class. It's not super user friendly
  const {coveoSearchParameters} =
    CoveoNextJsSearchParametersSerializer.fromUrlSearchParameters(
      url.searchParams
    );

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
      searchParameterManager: {
        initialState: {parameters: coveoSearchParameters},
      },
    },
  });

  return (
    <SearchPageProvider staticState={staticState}>
      <SearchParameterManager />
      <SearchBox />
      <ResultList />
      <AuthorFacet />
      <SourceFacet />
    </SearchPageProvider>
  );
}

// A page with search parameters cannot be statically rendered, since its rendered state should look different based on the current search parameters.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
export const dynamic = 'force-dynamic';
