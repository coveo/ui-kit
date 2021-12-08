import {useEffect, useState} from 'react';
import {Facet as HeadlessFacet} from '@coveo/headless';
import {Facet} from '../facet/facet.fn';

export const SingleParentMultipleDependentFacet: React.FunctionComponent<{
  parentFacet: HeadlessFacet;
  dependentFacets: HeadlessFacet[];
}> = ({parentFacet, dependentFacets}) => {
  const [showDependentFacet, setShowDependentFacet] = useState(false);
  const [parentState, setParentState] = useState(parentFacet.state);

  const linkFacets = () => {
    if (showDependentFacet && !parentState.hasActiveValues) {
      dependentFacets.forEach((dependent) => dependent.deselectAll());
    }
    setShowDependentFacet(parentState.hasActiveValues);
  };

  useEffect(
    () => parentFacet.subscribe(() => setParentState(parentFacet.state)),
    []
  );
  useEffect(linkFacets, [parentState.hasActiveValues]);

  const parent = <Facet controller={parentFacet} />;
  const dependent = (
    <>
      {dependentFacets.map((dependentFacet) => (
        <Facet controller={dependentFacet} />
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
