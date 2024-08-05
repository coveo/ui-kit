import {headers} from 'next/headers';
import SearchPage from '../_components/pages/search-page';
import {listingEngineDefinition} from '../_lib/commerce-engine';
import {NextJsNavigatorContext} from '../_lib/navigatorContextProvider';

export default async function Search() {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await listingEngineDefinition.fetchStaticState();
  return (
    <SearchPage
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    ></SearchPage>
  );
}

export const dynamic = 'force-dynamic';
