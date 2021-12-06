import {useEffect, useState} from 'react';
import {Facet as HeadlessFacet, FacetState} from '@coveo/headless';
import {Facet} from '../facet/facet.fn';

interface ComplexDependency {
  [facetId: string]: {
    facet: HeadlessFacet;
    controls?: HeadlessFacet[];
    dependsOn?: HeadlessFacet;
  };
}

interface ShowFacetState {
  [facetId: string]: boolean;
}

interface FacetDependencyState {
  [facetId: string]: FacetState;
}

export const ComplexDependentFacet: React.FunctionComponent<{
  dependencies: ComplexDependency;
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

  const relationship = () => {
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

  useEffect(() => {
    Object.entries(dependencies).forEach(([facetId, tree]) => {
      if (tree.controls) {
        tree.facet.subscribe(() =>
          setFacetDependencyState({
            ...facetDependencyState,
            [facetId]: tree.facet.state,
          })
        );
      }
    });
  }, []);

  useEffect(relationship, [facetDependencyState]);

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
