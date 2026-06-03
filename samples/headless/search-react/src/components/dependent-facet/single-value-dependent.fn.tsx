import {
  buildFacetConditionsManager,
  type CoreEngine,
  type Facet as HeadlessFacet,
} from '@coveo/headless';
import {useEffect, useState} from 'react';
import {Facet} from '../facet/facet.fn';

export const SingleValueDependentFacet: React.FunctionComponent<{
  engine: CoreEngine;
  parentFacet: HeadlessFacet;
  dependentFacet: HeadlessFacet;
  dependentValue: string;
}> = ({engine, parentFacet, dependentFacet, dependentValue}) => {
  const [showDependentFacet, setShowDependentFacet] = useState(false);

  useEffect(
    () =>
      dependentFacet.subscribe(() =>
        setShowDependentFacet(dependentFacet.state.enabled)
      ),
    []
  );

  useEffect(() => {
    const facetConditionsManager = buildFacetConditionsManager(engine, {
      facetId: dependentFacet.state.facetId,
      conditions: [
        {
          parentFacetId: parentFacet.state.facetId,
          condition: (parentValues) =>
            parentValues.some(
              (value) =>
                'value' in value &&
                value.value === dependentValue &&
                value.state === 'selected'
            ),
        },
      ],
    });
    return facetConditionsManager.stopWatching;
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
