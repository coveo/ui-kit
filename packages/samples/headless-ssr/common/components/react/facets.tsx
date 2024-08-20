'use client';

import {useEffect, useRef} from 'react';
import {useAuthorFacet, useTabManager} from '../../lib/react/engine';
import FacetCommon from '../common/facet';

export const AuthorFacet = () => {
  const {state, methods} = useAuthorFacet();
  const {state: tabManagerState} = useTabManager();

  useEffect(() => {
    const isActiveTabAllOrVideos =
      tabManagerState?.activeTab === 'all' ||
      tabManagerState?.activeTab === 'videos';

    if (isActiveTabAllOrVideos && !state.enabled) {
      methods?.enable();
    } else if (!isActiveTabAllOrVideos && state.enabled) {
      methods?.disable();
    }
  }, [tabManagerState?.activeTab, methods, state.enabled]);

  if (state.enabled === false) {
    return;
  }

  return (
    <FacetCommon
      title="Author"
      values={state.values}
      facetSearchQuery={state.facetSearch.query}
      facetSearchResults={state.facetSearch.values}
      isLoading={state.isLoading}
      onToggleValue={methods && ((value) => methods.toggleSelect(value))}
      onUpdateSearchQuery={
        methods && ((query) => methods.facetSearch.updateText(query))
      }
      onSubmitSearch={methods && (() => methods.facetSearch.search())}
      onToggleSearchResult={
        methods && ((result) => methods.facetSearch.select(result))
      }
    />
  );
};
