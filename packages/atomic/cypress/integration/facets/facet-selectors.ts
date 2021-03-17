export const FacetSelectors = {
  facetStandard: 'atomic-facet',
  facetSearchbox: 'input[part="search-input"]',
  checkbox: 'input[type="checkbox"]',
  showMoreButton: 'button[part="show-more"]',
  showLessButton: 'button[part="show-less"]',
  clearAllButton: 'button[part="reset-button"]',
  facetNumeric: 'atomic-numeric-facet',
  facetDate: 'atomic-date-facet',
};

export const BreadcrumbSelectors = {
  breadcrumb: 'atomic-breadcrumb-manager',
};

interface IAlias {
  [key: string]: string;
}

export const FacetAlias: IAlias = {
  facetShadow: '@facetShadow',
  facetUL: '@facet_ul',
  facetFirstValueLabel: '@facetFirstValueLabel',
  facetSecondValueLabel: '@facetSecondValueLabel',
  facetAllValueLabel: '@facetAllValueLabel',
  facetAllValueCount: '@facetAllValueCount',
};

const assignedFacetAlias = Object.assign({}, FacetAlias);

Object.keys(assignedFacetAlias).forEach((key: string) => {
  assignedFacetAlias[key] = assignedFacetAlias[key].split('@')[1];
});

const FacetAliasNoAtSign = assignedFacetAlias;

export const BreadcrumbAlias: IAlias = {
  breadcrumbFacet: '@breadcrumbFacet',
  breadcrumbClearAllFilter: '@breadcrumbClearAllFilter',
};

const assignedBreadCrumbAlias = Object.assign({}, BreadcrumbAlias);

Object.keys(assignedBreadCrumbAlias).forEach((key: string) => {
  assignedBreadCrumbAlias[key] = assignedBreadCrumbAlias[key].split('@')[1];
});

const BreadcrumbAliasNoAtSign = assignedBreadCrumbAlias;

export function createBreadcrumbShadowAlias() {
  cy.get(BreadcrumbSelectors.breadcrumb)
    .shadow()
    .find('.breadcrumbs')
    .as(BreadcrumbAliasNoAtSign.breadcrumbFacet);
  cy.get(BreadcrumbSelectors.breadcrumb)
    .shadow()
    .find('.breadcrumb-clear')
    .as(BreadcrumbAliasNoAtSign.breadcrumbClearAllFilter);
}
export function createAliasShadow(field: string, facetMainSelector?: string) {
  facetMainSelector = facetMainSelector
    ? facetMainSelector
    : FacetSelectors.facetStandard;
  const facetSelector = `${facetMainSelector}[field="${field}"]`;
  cy.get(facetSelector)
    .shadow()
    .find('div.facet div')
    .as(FacetAliasNoAtSign.facetShadow);
}

export function createAliasFacetUL(field: string, facetMainSelector?: string) {
  createAliasShadow(field, facetMainSelector);
  console.log(FacetAlias.facetShadow);
  cy.get(FacetAlias.facetShadow).find('ul').as(FacetAliasNoAtSign.facetUL);
  cy.get(FacetAlias.facetUL)
    .find('li:nth-child(1)')
    .as(FacetAliasNoAtSign.facetFirstValueLabel);
  cy.get(FacetAlias.facetUL)
    .find('li:nth-child(2)')
    .as(FacetAliasNoAtSign.facetSecondValueLabel);
  cy.get(FacetAlias.facetUL)
    .find('label span:nth-child(1)')
    .as(FacetAliasNoAtSign.facetAllValueLabel);
  cy.get(FacetAlias.facetUL)
    .find('label span:nth-child(2)')
    .as(FacetAliasNoAtSign.facetAllValueCount);
}
