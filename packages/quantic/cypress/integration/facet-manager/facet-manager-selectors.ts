import {ComponentSelector, CypressSelector} from '../common-selectors';

export const facetManagerComponent = 'c-quantic-facet-manager';

export interface FacetManagerSelector extends ComponentSelector {
  host: () => CypressSelector;
  item: () => CypressSelector;
}

export const FacetManagerSelectors = {
  get: () => cy.get(facetManagerComponent),

  host: () => FacetManagerSelectors.get().find('.facet-manager__host'),
  item: () =>
    FacetManagerSelectors.get().find(
      '.facet-manager__host_ready .facet-manager__item'
    ),
};
