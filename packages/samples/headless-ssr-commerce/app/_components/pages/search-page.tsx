'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';
import {
  SearchHydratedState,
  SearchStaticState,
  searchEngineDefinition,
} from '../../_lib/commerce-engine';
import FacetGenerator from '../facets/facet-generator';
import ProductList from '../product-list';
import {Recommendations} from '../recommendation-list';
import SearchBox from '../search-box';
import ShowMore from '../show-more';
import Summary from '../summary';
import Triggers from '../triggers/triggers';

export default function SearchPage({
  staticState,
  navigatorContext,
}: {
  staticState: SearchStaticState;
  navigatorContext: NavigatorContext;
}) {
  const [hydratedState, setHydratedState] = useState<
    SearchHydratedState | undefined
  >(undefined);

  // Setting the navigator context provider also in client-side before hydrating the application
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  useEffect(() => {
    searchEngineDefinition
      .hydrateStaticState({
        searchAction: staticState.searchAction,
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});

        // Refreshing recommendations in the browser after hydrating the state in the client-side
        // Recommendation refresh in the server is not supported yet.
        controllers.popularBoughtRecs.refresh();
      });
  }, [staticState]);

  return (
    <>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <Triggers
            redirectionStaticState={
              staticState.controllers.redirectionTrigger.state
            }
            redirectionController={
              hydratedState?.controllers.redirectionTrigger
            }
            queryStaticState={staticState.controllers.queryTrigger.state}
            queryDontroller={hydratedState?.controllers.queryTrigger}
            notifyStaticState={staticState.controllers.notifyTrigger.state}
            notifyController={hydratedState?.controllers.notifyTrigger}
          />
          <SearchBox
            staticState={staticState.controllers.searchBox.state}
            controller={hydratedState?.controllers.searchBox}
            staticStateRecentQueries={
              staticState.controllers.recentQueriesList.state
            }
            recentQueriesController={
              hydratedState?.controllers.recentQueriesList
            }
            staticStateInstantProducts={
              staticState.controllers.instantProducts.state
            }
            instantProductsController={
              hydratedState?.controllers.instantProducts
            }
          />
          <FacetGenerator
            staticState={staticState.controllers.facetGenerator.state}
            controller={hydratedState?.controllers.facetGenerator}
          />
          <Summary
            staticState={staticState.controllers.summary.state}
            controller={hydratedState?.controllers.summary}
          />
          <ProductList
            staticState={staticState.controllers.productList.state}
            controller={hydratedState?.controllers.productList}
          />
          {/* The ShowMore and Pagination components showcase two frequent ways to implement pagination. */}
          {/* <Pagination
          staticState={staticState.controllers.pagination.state}
          controller={hydratedState?.controllers.pagination}
        ></Pagination> */}
          <ShowMore
            staticState={staticState.controllers.pagination.state}
            controller={hydratedState?.controllers.pagination}
            summaryController={hydratedState?.controllers.summary}
          />
        </div>

        <div style={{flex: 1}}>
          <Recommendations
            staticState={staticState.controllers.popularBoughtRecs.state}
            controller={hydratedState?.controllers.popularBoughtRecs}
          />
        </div>
      </div>
    </>
  );
}
