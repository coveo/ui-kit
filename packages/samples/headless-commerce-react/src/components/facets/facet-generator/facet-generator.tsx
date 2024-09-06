import {FacetGenerator as HeadlessFacetGenerator} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import CategoryFacet from '../category-facet/category-facet';
import DateFacet from '../date-facet/date-facet';
import NumericFacet from '../numeric-facet/numeric-facet';
import RegularFacet from '../regular-facet/regular-facet';

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
      {facetState.map((facet, index) => {
        switch (facet.type) {
          case 'regular':
            return <RegularFacet key={index} controller={facet}></RegularFacet>;
          case 'numericalRange':
            return <NumericFacet key={index} controller={facet}></NumericFacet>;
          case 'dateRange':
            return <DateFacet key={index} controller={facet}></DateFacet>;
          case 'hierarchical':
            return (
              <CategoryFacet key={index} controller={facet}></CategoryFacet>
            );
          default:
            return null;
        }
      })}
    </nav>
  );
}
