import {useEffect, useState} from 'react';
import {Facet as HeadlessFacet, FacetState} from '@coveo/headless';
import {Facet} from '../facet/facet.fn';

interface MultiLevelDependency {
  [facetId: string]: {
    facet: HeadlessFacet;
    dependsOn?: HeadlessFacet;
  };
}

interface ShowFacetState {
  [facetId: string]: boolean;
}

interface FacetDependencyState {
  [facetId: string]: FacetState;
}

export const MultilevelDependentFacet: React.FunctionComponent<{
  dependencies: MultiLevelDependency;
}> = ({dependencies}) => {
  const [showFacet, setShowFacet] = useState<ShowFacetState>({});

  const [facetDependencyState, setFacetDependencyState] =
    useState<FacetDependencyState>(() => {
      return Object.entries(dependencies)
        .map(([facetId, tree]) => ({
          [facetId]: tree.facet.state,
        }))
        .reduce((previous, next) => ({...previous, ...next}), {});
    });

  const linkFacets = () => {
    const resultingState = {...showFacet};

    Object.keys(dependencies).forEach((facetId) => {
      resultingState[facetId] = true;

      if (dependencies[facetId].dependsOn) {
        const parentFacetHasActiveValues =
          dependencies[facetId].dependsOn!.state.hasActiveValues;

        if (!parentFacetHasActiveValues && showFacet[facetId]) {
          dependencies[facetId].facet.deselectAll();
        }

        resultingState[facetId] = parentFacetHasActiveValues;
      }
    });

    setShowFacet(resultingState);
  };

  const bindFacetsToState = () => {
    Object.entries(dependencies).forEach(([facetId, dependency]) => {
      dependency.facet.subscribe(() =>
        setFacetDependencyState({
          ...facetDependencyState,
          [facetId]: dependency.facet.state,
        })
      );
    });
  };

  useEffect(bindFacetsToState, []);
  useEffect(linkFacets, [facetDependencyState]);

  return (
    <>
      {Object.entries(showFacet).map(([facetId, showDependentFacet]) => {
        return (
          showDependentFacet && (
            <Facet key={facetId} controller={dependencies[facetId].facet} />
          )
        );
      })}
    </>
  );
};
