'use client';

import {useFacetGenerator} from '@/lib/commerce-engine';
import CategoryFacet from './category-facet';
import DateFacet from './date-facet';
import NumericFacet from './numeric-facet';
import RegularFacet from './regular-facet';

export default function FacetGenerator() {
  const {state, methods} = useFacetGenerator();

  return (
    <nav className="Facets">
      {state.map((facetState) => {
        const facetId = facetState.facetId;
        switch (facetState.type) {
          case 'regular': {
            return (
              <RegularFacet
                key={facetId}
                controller={methods?.getFacetController(facetId, 'regular')}
                staticState={facetState}
              />
            );
          }

          case 'numericalRange':
            return (
              <NumericFacet
                key={facetId}
                controller={methods?.getFacetController(
                  facetId,
                  'numericalRange'
                )}
                staticState={facetState}
              />
            );
          case 'dateRange':
            return (
              <DateFacet
                key={facetId}
                controller={methods?.getFacetController(facetId, 'dateRange')}
                staticState={facetState}
              />
            );
          case 'hierarchical':
            return (
              <CategoryFacet
                key={facetId}
                controller={methods?.getFacetController(
                  facetId,
                  'hierarchical'
                )}
                staticState={facetState}
              />
            );
          //TODO: add location facet support https://coveord.atlassian.net/browse/KIT-3808
          default:
            return null;
        }
      })}
    </nav>
  );
}
