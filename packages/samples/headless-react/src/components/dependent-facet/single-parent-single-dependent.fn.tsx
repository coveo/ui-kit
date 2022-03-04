import {useEffect, useState} from 'react';
import {
  buildFacetDependenciesManager,
  CoreEngine,
  Facet as HeadlessFacet,
} from '@coveo/headless';
import {Facet} from '../facet/facet.fn';

export const SingleParentSingleDependentFacet: React.FunctionComponent<{
  engine: CoreEngine;
  parentFacet: HeadlessFacet;
  dependentFacet: HeadlessFacet;
}> = ({engine, parentFacet, dependentFacet}) => {
  const [showDependentFacet, setShowDependentFacet] = useState(false);

  useEffect(
    () =>
      dependentFacet.subscribe(() =>
        setShowDependentFacet(dependentFacet.state.enabled)
      ),
    []
  );

  useEffect(() => {
    const facetDependenciesManager = buildFacetDependenciesManager(engine, {
      dependentFacetId: dependentFacet.state.facetId,
      dependencies: [
        {
          parentFacetId: parentFacet.state.facetId,
          isDependencyMet: (parentValues) =>
            parentValues.some((value) => value.state === 'selected'),
        },
      ],
    });
    return facetDependenciesManager.stopWatching;
  });

  const parent = <Facet controller={parentFacet} />;
  const dependent = <Facet controller={dependentFacet} />;

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
