import {ComponentSelector, CypressSelector} from '../common-selectors';

export const breadcrumbManager = 'c-quantic-breadcrumb-manager';

export interface BreadcrumbManagerSelector extends ComponentSelector {}

export const BreadcrumbManagerSelectors: BreadcrumbManagerSelector = {
  get: () => cy.get(breadcrumbManager),
};
