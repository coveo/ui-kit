import {useEffect, useState} from 'react';
import {Facet as HeadlessFacet, FacetState} from '@coveo/headless';
import {Facet} from '../facet/facet.fn';

export const ComplexTreeDependentFacet: React.FunctionComponent<{
  facetTree: {
    [facetId: string]: {
      facet: HeadlessFacet;
      controls?: HeadlessFacet[];
      dependsOn?: HeadlessFacet;
    };
  };
}> = ({facetTree}) => {
  const [showFacet, setShowFacet] = useState<{
    [facetId: string]: boolean;
  }>({});

  const [facetTreeState, setFacetTreeState] = useState<{
    [facetId: string]: FacetState;
  }>(() => {
    return Object.entries(facetTree)
      .map(([facetId, tree]) => ({
        [facetId]: tree.facet.state,
      }))
      .reduce((previous, next) => ({...previous, ...next}), {});
  });

  const relationship = () => {
    const resultingState = {...showFacet};

    Object.keys(facetTree).forEach((facetId) => {
      resultingState[facetId] = true;
      if (facetTree[facetId].dependsOn) {
        const parentFacetHasActiveValues =
          facetTree[facetId].dependsOn!.state.hasActiveValues;

        if (!parentFacetHasActiveValues && showFacet[facetId]) {
          facetTree[facetId].facet.deselectAll();
        }

        resultingState[facetId] = parentFacetHasActiveValues;
      }
    });

    setShowFacet(resultingState);
  };

  useEffect(() => {
    Object.entries(facetTree).forEach(([key, value]) => {
      if (value.controls) {
        value.facet.subscribe(() =>
          setFacetTreeState({...facetTreeState, [key]: value.facet.state})
        );
      }
    });
  }, []);

  useEffect(relationship, [facetTreeState]);

  return (
    <>
      {Object.entries(showFacet).map(([facetId, showDependentFacet]) => {
        return (
          showDependentFacet && (
            <Facet key={facetId} controller={facetTree[facetId].facet} />
          )
        );
      })}
    </>
  );
};
