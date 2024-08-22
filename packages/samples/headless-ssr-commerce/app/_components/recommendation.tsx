'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';
import {
  RecommendationStaticState,
  RecommendationHydratedState,
  recommendationEngineDefinition,
} from '../_lib/commerce-engine';
import {Recommendations} from './recommendation-list';

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
        searchAction: staticState.searchAction,
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});

        // Refreshing recommendations in the browser after hydrating the state in the client-side
        // Recommendation refresh in the server is not supported yet.
        controllers.popularBoughtRecs.refresh();
        controllers.popularViewedRecs.refresh();
      });
  }, [staticState]);

  return (
    <>
      <Recommendations
        staticState={staticState.controllers.popularBoughtRecs.state}
        controller={hydratedState?.controllers.popularBoughtRecs}
      />
      <Recommendations
        staticState={staticState.controllers.popularViewedRecs.state}
        controller={hydratedState?.controllers.popularViewedRecs}
      />
    </>
  );
}
