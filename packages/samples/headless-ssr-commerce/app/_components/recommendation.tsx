'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';
import {
  RecommendationStaticState,
  RecommendationHydratedState,
  recommendationEngineDefinition,
} from '../_lib/commerce-engine';
import {ProductList} from './product-list';

export default function Recommendation({
  staticState,
  navigatorContext,
}: {
  staticState: RecommendationStaticState;
  navigatorContext: NavigatorContext;
}) {
  const [hydratedState, setHydratedState] = useState<
    RecommendationHydratedState | undefined
  >(undefined);

  // Setting the navigator context provider also in client-side before hydrating the application
  recommendationEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  useEffect(() => {
    recommendationEngineDefinition
      .hydrateStaticState({
        searchActions: staticState.searchActions,
        // TODO: Find a way to pass it from static state
        recommendationSlots: [
          // 'd73afbd2-8521-4ee6-a9b8-31f064721e73',
          // 'af4fb7ba-6641-4b67-9cf9-be67e9f30174',
          'popularViewedRecs',
          'popularBoughtRecs',
        ],
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});
      });
  }, [staticState]);

  return (
    <>
      {/* TODO: add UI component here */}
      <h2>{staticState.controllers.popularBoughtRecs.state.headline}</h2>
      <ProductList
        staticState={staticState.controllers.popularBoughtRecs.state}
        controller={hydratedState?.controllers.popularBoughtRecs}
      />
      <h2>{staticState.controllers.popularViewedRecs.state.headline}</h2>
      <ProductList
        staticState={staticState.controllers.popularViewedRecs.state}
        controller={hydratedState?.controllers.popularViewedRecs}
      />
      {/* <Summary
        staticState={staticState.controllers.summary.state}
        controller={hydratedState?.controllers.summary}
        hydratedState={hydratedState}
      /> */}
    </>
  );
}
