import {createContext, useContext} from 'react';

const FacetSearchOfferedContext = createContext(true);

/**
 * Whether the Facets placed under it offer facet search. A block whose server does not answer
 * facet search draws its Facets without a search field.
 */
export const FacetSearchOffered = FacetSearchOfferedContext.Provider;

export function useFacetSearchOffered(): boolean {
  return useContext(FacetSearchOfferedContext);
}
