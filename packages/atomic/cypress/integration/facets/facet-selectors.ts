import {IAlias, aliasNoAtSignBuilder} from '../../utils/componentUtils';

export const FacetSelectors = {
  facetStandard: 'atomic-facet',
  facetSearchbox: 'input[part="search-input"]',
  checkbox: 'input[type="checkbox"]',
  label: 'label',
  labelText: 'label span:nth-child(1)',
  labelCount: 'label span:nth-child(2)',
  showMoreButton: 'button[part="show-more"]',
  showLessButton: 'button[part="show-less"]',
  clearAllButton: 'button[part="reset-button"]',
  numericFacet: 'atomic-numeric-facet',
  dateFacet: 'atomic-date-facet',
  categoryFacet: 'atomic-category-facet',
  categoryFacetNextLevelButton: 'button',
  categoryFacetClearLevelButton: 'div:nth-child(2) div:nth-child(1) button',
};

export const BreadcrumbSelectors = {
  breadcrumb: 'atomic-breadcrumb-manager',
};

export const FacetAlias: IAlias = {
  facetShadow: '@facetShadow',
  facetUL: '@facetUL',
  facetFirstValue: '@facetFirstValue',
  facetSecondValue: '@facetSecondValue',
  facetAllValueLabel: '@facetAllValueLabel',
  facetAllValueCount: '@facetAllValueCount',
};

export const BreadcrumbAlias: IAlias = {
  breadcrumbFacet: '@breadcrumbFacet',
  breadcrumbClearAllFilter: '@breadcrumbClearAllFilter',
};

const FacetAliasNoAtSign = aliasNoAtSignBuilder(FacetAlias);
const BreadcrumbAliasNoAtSign = aliasNoAtSignBuilder(BreadcrumbAlias);

export function createBreadcrumbShadowAlias() {
  cy.get(BreadcrumbSelectors.breadcrumb)
    .shadow()
    .find('ul[part="breadcrumbs"]')
    .as(BreadcrumbAliasNoAtSign.breadcrumbFacet);
  cy.get(BreadcrumbSelectors.breadcrumb)
    .shadow()
    .find('button[part="breadcrumb-clear-all"]')
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
  cy.get(FacetAlias.facetShadow)
    .find('ul')
    .not('[part="parents"]')
    .as(FacetAliasNoAtSign.facetUL);
  cy.get(FacetAlias.facetUL)
    .find('li:nth-child(1)')
    .as(FacetAliasNoAtSign.facetFirstValue);
  cy.get(FacetAlias.facetUL)
    .find('li:nth-child(2)')
    .as(FacetAliasNoAtSign.facetSecondValue);

  const facetValueLabelCSS =
    facetMainSelector === FacetSelectors.categoryFacet ? 'button' : 'label';

  cy.get(FacetAlias.facetUL)
    .find(`${facetValueLabelCSS} span:nth-child(1)`)
    .as(FacetAliasNoAtSign.facetAllValueLabel);
  cy.get(FacetAlias.facetUL)
    .find(`${facetValueLabelCSS} span:nth-child(2)`)
    .as(FacetAliasNoAtSign.facetAllValueCount);
}
