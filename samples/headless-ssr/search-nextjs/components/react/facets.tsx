'use client';

import {useAuthorFacet} from '../../lib/react/engine';
import FacetCommon from '../common/facet';

export const AuthorFacet = () => {
  const {state, methods} = useAuthorFacet();

  if (!state.enabled) {
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
