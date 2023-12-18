'use client';

import {Facet, FacetState} from '@coveo/headless';
import {useAuthorFacet, useSourceFacet} from '../../lib/react/engine';
import FacetCommon from '../common/facet';

const facet = (
  title: string,
  state: FacetState,
  methods?: Omit<Facet, 'state' | 'subscribe'>
) => {
  return (
    <FacetCommon
      title={title}
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

export const AuthorFacet = () => {
  const {state, methods} = useAuthorFacet();
  return facet('Author', state, methods);
};

export const SourceFacet = () => {
  const {state, methods} = useSourceFacet();
  return facet('Source', state, methods);
};
