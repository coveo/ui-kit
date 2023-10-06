import {FacetState, Facet as FacetController} from '@coveo/headless/ssr';
import {useEffect, useState, FunctionComponent} from 'react';
import FacetCommon from '../common/facet';

interface FacetProps {
  title: string;
  staticState: FacetState;
  controller?: FacetController;
}

export const Facet: FunctionComponent<FacetProps> = ({
  title,
  staticState,
  controller,
}) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );

  return (
    <FacetCommon
      title={title}
      values={state.values}
      facetSearchQuery={state.facetSearch.query}
      facetSearchResults={state.facetSearch.values}
      isLoading={state.isLoading}
      onToggleValue={controller && ((value) => controller.toggleSelect(value))}
      onUpdateSearchQuery={
        controller && ((query) => controller.facetSearch.updateText(query))
      }
      onSubmitSearch={controller && (() => controller.facetSearch.search())}
      onToggleSearchResult={
        controller && ((result) => controller.facetSearch.select(result))
      }
    />
  );
};
