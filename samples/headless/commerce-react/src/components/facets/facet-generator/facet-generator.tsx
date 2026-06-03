import type {FacetGenerator as HeadlessFacetGenerator} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import CategoryFacet from '../category-facet/category-facet.js';
import DateFacet from '../date-facet/date-facet.js';
import NumericFacet from '../numeric-facet/numeric-facet.js';
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

  if (facetState.length === 0) {
    return null;
  }

  return (
    <nav className="Facets">
      {facetState.map((facet) => {
        switch (facet.type) {
          case 'regular':
            return (
              <RegularFacet
                key={facet.state.facetId}
                controller={facet}
              ></RegularFacet>
            );
          case 'numericalRange':
            return (
              <NumericFacet
                key={facet.state.facetId}
                controller={facet}
              ></NumericFacet>
            );
          case 'dateRange':
            return (
              <DateFacet
                key={facet.state.facetId}
                controller={facet}
              ></DateFacet>
            );
          case 'hierarchical':
            return (
              <CategoryFacet
                key={facet.state.facetId}
                controller={facet}
              ></CategoryFacet>
            );
          default:
            return null;
        }
      })}
    </nav>
  );
}
