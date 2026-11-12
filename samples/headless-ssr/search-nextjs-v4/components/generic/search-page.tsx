'use client';

import {useEffect, useState} from 'react';
import {
  type SearchHydratedState,
  type SearchStaticState,
  searchEngineDefinition,
} from '@/lib/generic/engine';
import HydrationMetadataCommon from '../common/hydration-metadata';
import ResultListCommon from '../common/result-list';
import Facet from './facet';
import ParameterManager from './parameter-manager';
import SearchBox from './search-box';
import Tab from './tab';
import {useControllerState} from './use-controller-state';

/**
 * Renders the static state fetched on the server, then hydrates it in the browser by hand, as an
 * application without the React wrapper does (Angular, Vue, plain Node.js).
 */
export default function SearchPage({staticState}: {staticState: SearchStaticState}) {
  const [hydratedState, setHydratedState] = useState<SearchHydratedState>();

  useEffect(() => {
    searchEngineDefinition.hydrateStaticState(staticState).then(setHydratedState);
  }, [staticState]);

  const resultList = useControllerState(
    staticState.controllers.resultList.state,
    hydratedState?.controllers.resultList
  );

  return (
    <>
      <ParameterManager
        staticState={staticState.controllers.parameterManager.state}
        controller={hydratedState?.controllers.parameterManager}
      />
      <SearchBox
        staticState={staticState.controllers.searchBox.state}
        controller={hydratedState?.controllers.searchBox}
      />
      <div role="tablist">
        <Tab
          label="All"
          staticState={staticState.controllers.tabAll.state}
          controller={hydratedState?.controllers.tabAll}
        />
        <Tab
          label="Countries"
          staticState={staticState.controllers.tabCountries.state}
          controller={hydratedState?.controllers.tabCountries}
        />
        <Tab
          label="Videos"
          staticState={staticState.controllers.tabVideos.state}
          controller={hydratedState?.controllers.tabVideos}
        />
      </div>
      <Facet
        title="Author"
        staticState={staticState.controllers.authorFacet.state}
        controller={hydratedState?.controllers.authorFacet}
      />
      <ResultListCommon results={resultList.results} />
      <HydrationMetadataCommon hydrated={!!hydratedState} resultCount={resultList.results.length} />
    </>
  );
}
