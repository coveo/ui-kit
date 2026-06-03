import {
  buildFacetConditionsManager,
  type CoreEngine,
  type Facet as HeadlessFacet,
} from '@coveo/headless';
import {useEffect, useState} from 'react';
import {Facet} from '../facet/facet.fn';

export const SingleParentMultipleDependentFacet: React.FunctionComponent<{
  engine: CoreEngine;
  parentFacet: HeadlessFacet;
  dependentFacets: HeadlessFacet[];
}> = ({engine, parentFacet, dependentFacets}) => {
  const [showDependentFacet, setShowDependentFacet] = useState(false);

  dependentFacets.forEach((facet) => {
    useEffect(
      () => facet.subscribe(() => setShowDependentFacet(facet.state.enabled)),
      []
    );
  });

  dependentFacets.forEach((facet) => {
    useEffect(() => {
      const facetConditionsManager = buildFacetConditionsManager(engine, {
        facetId: facet.state.facetId,
        conditions: [
          {
            parentFacetId: parentFacet.state.facetId,
            condition: (parentValues) =>
              parentValues.some((value) => value.state === 'selected'),
          },
        ],
      });
      return facetConditionsManager.stopWatching;
    });
  });

  const parent = <Facet controller={parentFacet} />;
  const dependent = (
    <>
      {dependentFacets.map((dependentFacet) => (
        <Facet controller={dependentFacet} key={dependentFacet.state.facetId} />
      ))}
    </>
  );

  return (
    <>
      <div>
        <h4>Parent facet</h4>
        {parent}
      </div>
      <div>
        <h4>Dependent facet</h4>
        {showDependentFacet ? dependent : null}
      </div>
    </>
  );
};
