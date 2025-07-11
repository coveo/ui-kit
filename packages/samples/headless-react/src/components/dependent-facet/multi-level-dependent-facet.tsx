import {
  buildFacetConditionsManager,
  type CoreEngine,
  type Facet as HeadlessFacet,
} from '@coveo/headless';
import {useEffect, useState} from 'react';
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

export const MultilevelDependentFacet: React.FunctionComponent<{
  engine: CoreEngine;
  dependencies: MultiLevelDependency;
}> = ({engine, dependencies}) => {
  const [showFacet, setShowFacet] = useState<ShowFacetState>({});

  Object.values(dependencies).forEach(({facet}) => {
    useEffect(
      () =>
        facet.subscribe(() =>
          setShowFacet((otherValues) => ({
            ...otherValues,
            [facet.state.facetId]: facet.state.enabled,
          }))
        ),
      []
    );
  });

  Object.values(dependencies).forEach(({facet, dependsOn}) => {
    useEffect(() => {
      if (!dependsOn) {
        return;
      }
      const facetConditionsManager = buildFacetConditionsManager(engine, {
        facetId: facet.state.facetId,
        conditions: [
          {
            parentFacetId: dependsOn.state.facetId,
            condition: (parentValues) =>
              parentValues.some((value) => value.state === 'selected'),
          },
        ],
      });
      return facetConditionsManager.stopWatching;
    });
  });

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
