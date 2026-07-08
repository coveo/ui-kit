import type {FacetGenerator as HeadlessFacetGenerator} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import RegularFacet from '../regular-facet/regular-facet.js';

interface IFacetGeneratorProps {
  controller: HeadlessFacetGenerator;
}

export default function FacetGenerator(props: IFacetGeneratorProps) {
  const {controller} = props;

  const [facetState, setFacetState] = useState(controller.facets);

  useEffect(() => {
    controller.subscribe(() => {
      setFacetState(controller.facets);
    });
  }, [controller]);

  // To keep the sample simple and focused, only regular (checkbox) facets are
  // rendered. Numeric, date, and hierarchical facets each need their own UI.
  if (!facetState.some((facet) => facet.type === 'regular')) {
    return null;
  }

  return (
    <nav className="Facets">
      {facetState.map((facet) =>
        facet.type === 'regular' ? (
          <RegularFacet key={facet.state.facetId} controller={facet} />
        ) : null
      )}
    </nav>
  );
}
