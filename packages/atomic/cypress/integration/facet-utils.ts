import {getAnalyticsAt, getApiRequestBodyAt} from '../utils/network';

import {FacetSelectors} from './facet-selectors';

export function validateFacetComponentLoaded(label: string) {
  cy.get(FacetSelectors.facetStandard).should('be.visible');
  cy.get('@facetShadow').find('div:nth-child(1)').should('contain.text', label);
  cy.checkA11y(FacetSelectors.facetStandard);
}

export function validateFacetNumberofValue(totalNumber: number) {
  cy.wait(200);
  cy.get('@facet_ul').find('li').its('length').should('eq', totalNumber);
}

export function facetValueShouldDisplayInBreadcrumb(
  facetValueSelector: string,
  valueDisplayInBreadcrumbSelector: string
) {
  cy.get(facetValueSelector)
    .find('label span:nth-child(1)')
    .invoke('text')
    .then((text) => {
      cy.get('@breadcrumbFacet')
        .first()
        .find(valueDisplayInBreadcrumbSelector)
        .debug()
        .should('be.visible')
        .contains(text);
    });
}

export async function assertBasicFacetFunctionality(
  selector: string,
  field: string
) {
  cy.get(selector).click();
  cy.get(selector).find(FacetSelectors.checkbox).should('be.checked');

  const analyticsBody = (await getAnalyticsAt('@coveoAnalytics', 1)).request
    .body;

  expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
  expect(analyticsBody.customData).to.have.property('facetField', field);
  expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
  expect(analyticsBody.facetState[0]).to.have.property('field', field);
}

export async function assertSortCriteria(
  sortOption: string,
  requestBodyOrder: number
) {
  const requestBody = await getApiRequestBodyAt(
    '@coveoSearch',
    requestBodyOrder
  );
  const firstRequestBodyFacets = (requestBody.facets as any)[0];

  expect(firstRequestBodyFacets).to.have.property('sortCriteria', sortOption);
}
