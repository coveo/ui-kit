import {IAlias, aliasNoAtSignBuilder} from '../../../utils/componentUtils';
import {facetField} from './facet-actions';
export const facetComponent = 'atomic-facet';
export const numericFacetComponent = 'atomic-numeric-facet';
export const dateFacetComponent = 'atomic-date-facet';

export const FacetSelector = {
  shadow: (field = facetField, type = facetComponent) =>
    cy.get(`${type}[field="${field}"]`).shadow(),
  wrapper: (field = facetField, type = facetComponent) =>
    FacetSelector.shadow(field, type).find('[part="facet"]'),
  label: (field = facetField, type = facetComponent) =>
    FacetSelector.shadow(field, type).find('[part="label"]'),
  facetValues: (field = facetField, type = facetComponent) =>
    FacetSelector.shadow(field, type).find('ul').find('li'),
  valueLabels: (field = facetField, type = facetComponent) =>
    FacetSelector.shadow(field, type).find('[part="value-label"]'),
  valueCounts: (field = facetField, type = facetComponent) =>
    FacetSelector.shadow(field, type).find('[part="value-count"]'),
  facetSearchBox: (field = facetField, type = facetComponent) =>
    FacetSelector.shadow(field, type).find('[part="search-input"]'),
  showMoreButton: (field = facetField, type = facetComponent) =>
    FacetSelector.shadow(field, type).find('[part="show-more"]'),
  showLessButton: (field = facetField, type = facetComponent) =>
    FacetSelector.shadow(field, type).find('[part="show-less"]'),
  facetClearAllFilter: (field = facetField, type = facetComponent) =>
    FacetSelector.shadow(field, type).find('[part="clear-button"]'),
  selectedCheckboxValue: (field = facetField, type = facetComponent) =>
    FacetSelector.shadow(field, type).find(
      '[part="value"] button[aria-checked="true"]'
    ),
  facetValueAtIndex: (
    index: number,
    field = facetField,
    type = facetComponent
  ) => FacetSelector.facetValues(field, type).eq(index),
  facetCheckboxAtIndex: (
    index: number,
    field = facetField,
    type = facetComponent
  ) =>
    FacetSelector.facetValueAtIndex(index, field, type).find(
      'button[role="checkbox"]'
    ),
  facetValueLabelAtIndex: (
    index: number,
    field = facetField,
    type = facetComponent
  ) =>
    FacetSelector.facetValueAtIndex(index, field, type).find(
      '[part="value-label"]'
    ),
  facetPlaceHolder: (field = facetField, type = facetComponent) =>
    FacetSelector.shadow(field, type).find('[part="placeholder"]'),
};

export const FacetSelectors = {
  facetStandard: 'atomic-facet',
  facetSearchbox: 'input[part="search-input"]',
  checkbox: 'button[role="checkbox"]',
  label: 'label',
  labelText: 'label span:nth-child(1)',
  labelCount: 'label span:nth-child(2)',
  showMoreButton: 'button[part="show-more"]',
  showLessButton: 'button[part="show-less"]',
  clearAllButton: 'button[part="clear-button"]',
  numericFacet: 'atomic-numeric-facet',
  dateFacet: 'atomic-date-facet',
  categoryFacet: 'atomic-category-facet',
  categoryFacetNextLevelButton: 'button[part="child"]',
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
  breadcrumbs: '@breadcrumbs',
  showMoreButton: '@showMoreButton',
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

  cy.get(BreadcrumbSelectors.breadcrumb)
    .shadow()
    .find('button[part="breadcrumb"][title]')
    .as(BreadcrumbAliasNoAtSign.breadcrumbs);

  cy.get(BreadcrumbSelectors.breadcrumb)
    .shadow()
    .find('button[part="breadcrumb"]')
    .last()
    .as(BreadcrumbAliasNoAtSign.showMoreButton);
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
