import {getApiRequestBodyAt} from '../utils/network';

import {FacetSelectors} from './facet-selectors';
import {
  revertFormatNumericFacet,
  revertFormatedDateFacet,
} from '../utils/componentUtils';

export const FacetType = {
  numericFacet: 'numericalRange',
  dateFacet: 'dateRange',
};

export function validateFacetComponentLoaded(
  label: string,
  facetSelector?: string
) {
  facetSelector = facetSelector ? facetSelector : FacetSelectors.facetStandard;
  cy.get(facetSelector).should('be.visible');
  cy.get('@facetShadow').find('div:nth-child(1)').should('contain.text', label);
  cy.checkA11y(facetSelector);
  assertNonZeroFacetCount();
}

export function validateFacetNumberofValueEqual(totalNumber: number) {
  cy.wait(200);
  cy.get('@facet_ul').find('li').its('length').should('eq', totalNumber);
}

export function validateFacetNumberofValueGreaterThan(totalNumber: number) {
  cy.get('@facet_ul').find('li').its('length').should('be.gt', totalNumber);
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
        // .debug()
        .should('be.visible')
        .contains(text);
    });
}

export function assertBasicFacetFunctionality(selector: string, field: string) {
  cy.get(selector).click();
  cy.get(selector).find(FacetSelectors.checkbox).should('be.checked');
  assertNonZeroFacetCount();
  cy.get(selector)
    .find('label span:nth-child(1)')
    .invoke('text')
    .then((txt) => {
      cy.getAnalyticsAt('@coveoAnalytics', 1).then((analyticsBody: any) => {
        const facetTypeDetected = analyticsBody.facetState[0].facetType;
        txt = convertFacetValueToAPIformat(txt.trim(), facetTypeDetected);

        expect(analyticsBody.customData).to.have.property('facetValue', txt);
        expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
        expect(analyticsBody.customData).to.have.property('facetField', field);
        expect(analyticsBody.facetState[0]).to.have.property(
          'state',
          'selected'
        );
        expect(analyticsBody.facetState[0]).to.have.property('field', field);
      });
    });
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

export function convertFacetValueToAPIformat(
  value: string,
  facetTypeOption?: string,
  valueSeparator?: string
) {
  value = value.trim();
  valueSeparator = valueSeparator ? valueSeparator : 'to';
  const splitByValue = ` ${valueSeparator} `;
  const start = value.split(splitByValue)[0];
  const end = value.split(splitByValue)[1];

  switch (facetTypeOption) {
    case FacetType.numericFacet: {
      const formtedStart = revertFormatNumericFacet(start);
      const formatedEnd = revertFormatNumericFacet(end);
      return `${formtedStart}..${formatedEnd}`;
    }
    case FacetType.dateFacet: {
      const formtedStart = `${revertFormatedDateFacet(start)}@00:00:00`;
      const formatedEnd = `${revertFormatedDateFacet(end)}@00:00:00`;
      return `${formtedStart}..${formatedEnd}`;
    }
    default:
      return value;
  }
}

export interface NumericRange {
  start: number;
  end: number;
}
export interface DateRange {
  start: string;
  end: string;
}

export function convertRangeToFacetValue(
  range: NumericRange,
  valueSeparator?: string
) {
  valueSeparator = valueSeparator ? valueSeparator : ' to ';
  const formatedStartValue = new Intl.NumberFormat().format(range.start);
  const formatedEndValue = new Intl.NumberFormat().format(range.end);

  return `${formatedStartValue}${valueSeparator}${formatedEndValue}`;
}

export function convertDateToFacetValue(
  range: DateRange,
  valueSeparator?: string
) {
  valueSeparator = valueSeparator ? valueSeparator : ' to ';
  return `${range.start}${valueSeparator}${range.end}`;
}

export function assertDeselectFacet(field: string) {
  cy.get('@firstFacetValue').click();
  cy.wait(500);
  cy.get('@firstFacetValue')
    .click()
    .find(FacetSelectors.checkbox)
    .should('not.be.checked');
  cy.getAnalyticsAt('@coveoAnalytics', 2).then((analyticsBody: any) => {
    expect(analyticsBody).to.have.property('actionCause', 'facetDeselect');
    expect(analyticsBody.customData).to.have.property('facetField', field);
  });
}

export function assertClearAllFacet() {
  cy.get('@firstFacetValue').click();
  cy.get('@secondFacetValue').click();
  cy.get('@facetShadow').find(FacetSelectors.clearAllButton).click();
  cy.get('@firstFacetValue')
    .find(FacetSelectors.checkbox)
    .should('not.be.checked');
  cy.get('@secondFacetValue')
    .find(FacetSelectors.checkbox)
    .should('not.be.checked');
  cy.getAnalyticsAt('@coveoAnalytics', 3).then((analyticsBody) => {
    expect(analyticsBody).to.have.property('actionCause', 'facetClearAll');
    expect(analyticsBody.facetState).to.have.lengthOf(0);
  });
}

export function assertNonZeroFacetCount(selector?: string) {
  selector = selector ? selector : '@allFacetValueCount';
  cy.getTextOfAllElements(selector).then((counts) => {
    expect(counts).not.to.include('0');
  });
}

export function convertDateFormatLabel(date: string, formatType?: string) {
  formatType = formatType ? formatType : 'DD/MM/YYYY';
  console.log(formatType);
  const splitDate = date.split('/');
  const year = splitDate[2];
  let month = splitDate[1];
  const day = splitDate[0];
  const generateDate = new Date(Number(year), Number(month) - 1, Number(day));
  switch (formatType) {
    case 'DD/MMM/YYYY': {
      month = generateDate.toLocaleString('en', {month: 'short'});
      return `${day}/${month}/${year}`;
    }
    default:
      return date;
  }
}
