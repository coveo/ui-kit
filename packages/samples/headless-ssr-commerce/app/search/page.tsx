import {buildSSRCommerceSearchParameterSerializer} from '@coveo/headless/ssr-commerce';
import {headers} from 'next/headers';
import SearchPage from '../_components/pages/search-page';
import {searchEngineDefinition} from '../_lib/commerce-engine';
import {NextJsNavigatorContext} from '../_lib/navigatorContextProvider';

interface ISearchProps {
  searchParams: URLSearchParams;
}

export default async function Search(props: ISearchProps) {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  const {toCommerceSearchParameters} =
    buildSSRCommerceSearchParameterSerializer();
  const parameters = toCommerceSearchParameters(props.searchParams);

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await searchEngineDefinition.fetchStaticState({
    controllers: {
      searchParameterManager: {initialState: {parameters}},
    },
  });

  return (
    <SearchPage
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    ></SearchPage>
  );
}

export const dynamic = 'force-dynamic';
