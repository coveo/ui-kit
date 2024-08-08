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

        // Refreshing recommendations after hydrating the state in the client-side
        // Recommendation slots are refreshed in the server. This might be a future improvement.
        controllers.popularBoughtRecs.refresh();
        controllers.popularViewedRecs.refresh();
      });
  }, [staticState]);

  return (
    <>
      {/* TODO: add UI component here */}
      <h2>{staticState.controllers.popularBoughtRecs.state.headline}</h2>
      <Recommendations
        staticState={staticState.controllers.popularBoughtRecs.state}
        controller={hydratedState?.controllers.popularBoughtRecs}
      />
      <h2>{staticState.controllers.popularViewedRecs.state.headline}</h2>
      <Recommendations
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
