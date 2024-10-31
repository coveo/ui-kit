'use client';

import {useFacetGenerator} from '@/app/_lib/commerce-engine';
import CategoryFacet from './category-facet';
import DateFacet from './date-facet';
import NumericFacet from './numeric-facet';
import RegularFacet from './regular-facet';

export default function FacetGenerator() {
  const {state, controller} = useFacetGenerator();

  return (
    <nav className="Facets">
      {state.map((facetState) => {
        const facetId = facetState.facetId;
        switch (facetState.type) {
          case 'regular': {
            return (
              <RegularFacet
                key={facetId}
                controller={controller?.getFacetController(facetId, 'regular')}
                staticState={facetState}
              />
            );
          }

          case 'numericalRange':
            return (
              <NumericFacet
                key={facetId}
                controller={controller?.getFacetController(
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
                controller={controller?.getFacetController(
                  facetId,
                  'dateRange'
                )}
                staticState={facetState}
              />
            );
          case 'hierarchical':
            return (
              <CategoryFacet
                key={facetId}
                controller={controller?.getFacetController(
                  facetId,
                  'hierarchical'
                )}
                staticState={facetState}
              />
            );
          default:
            return null;
        }
      })}
    </nav>
  );
}
