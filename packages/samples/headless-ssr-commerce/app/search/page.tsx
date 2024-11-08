import {headers} from 'next/headers';
import BreadcrumbManager from '../_components/breadcrumb-manager';
import FacetGenerator from '../_components/facets/facet-generator';
import SearchPage from '../_components/pages/search-page';
import ProductList from '../_components/product-list';
import Recommendations from '../_components/recommendation-list';
import SearchBox from '../_components/search-box';
import ShowMore from '../_components/show-more';
import Summary from '../_components/summary';
import Triggers from '../_components/triggers/triggers';
import {searchEngineDefinition} from '../_lib/commerce-engine';
import {NextJsNavigatorContext} from '../_lib/navigatorContextProvider';

export default async function Search() {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await searchEngineDefinition.fetchStaticState();
  return (
    <SearchPage
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    >
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <Triggers />
          <SearchBox />
          <BreadcrumbManager />
          <FacetGenerator />
          <Summary />
          <ProductList />
          {/* The ShowMore and Pagination components showcase two frequent ways to implement pagination. */}
          {/* <Pagination
          staticState={staticState.controllers.pagination.state}
          controller={hydratedState?.controllers.pagination}
        ></Pagination> */}
          <ShowMore />
        </div>

        <div style={{flex: 1}}>
          {/* popularBoughtRecs */}
          {/* TODO: KIT-3503: need to revisit the way recommendations are added*/}
          <Recommendations />
        </div>
      </div>
    </SearchPage>
  );
}

export const dynamic = 'force-dynamic';
