import {getApiRequestBodyAt} from '../../utils/network';
import {FacetSelectors, FacetAlias, BreadcrumbAlias} from './facet-selectors';

export const FacetType = {
  numericFacet: 'numericalRange',
  dateFacet: 'dateRange',
};

export function validateFacetComponentLoaded(
  label: string,
  facetSelector?: string
) {
  facetSelector = facetSelector ? facetSelector : FacetSelectors.facetStandard;
  cy.get(`${facetSelector}[label="${label}"]`).should('be.visible');
  cy.get(FacetAlias.facetShadow)
    .find('div:nth-child(1)')
    .should('contain.text', label);
  cy.checkA11y(facetSelector);
  assertNonZeroFacetCount();
}

export function validateFacetComponentVisible(
  label: string,
  facetSelector?: string
) {
  facetSelector = facetSelector ? facetSelector : FacetSelectors.facetStandard;
  cy.get(`${facetSelector}[label=${label}]`).should('exist');
  cy.get(`${facetSelector}[label=${label}]`).should('not.be.visible');
}

export function validateFacetNumberofValueEqual(totalNumber: number) {
  cy.wait(200);
  cy.get(FacetAlias.facetUL).find('li').its('length').should('eq', totalNumber);
}

export function validateFacetNumberofValueGreaterThan(totalNumber: number) {
  cy.get(FacetAlias.facetUL)
    .find('li')
    .its('length')
    .should('be.gt', totalNumber);
}

export function facetValueShouldDisplayInBreadcrumb(
  facetValueSelector: string,
  nthBreadcrumb: number
) {
  cy.get(facetValueSelector)
    .find(FacetSelectors.labelText)
    .invoke('text')
    .then((text) => {
      cy.get(BreadcrumbAlias.breadcrumbFacet)
        .first()
        .find(`li:nth-child(${nthBreadcrumb})`)
        .should('be.visible')
        .contains(text);
    });
}

export function assertBasicFacetFunctionality(field: string) {
  cy.wait('@coveoAnalytics');

  cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();
  cy.wait('@coveoAnalytics').then(({request}) => {
    const analyticsBody = request.body;
    expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
    expect(analyticsBody.customData).to.have.property('facetField', field);
    expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
    expect(analyticsBody.facetState[0]).to.have.property('field', field);

    cy.get(FacetAlias.facetFirstValue)
      .find(FacetSelectors.labelText)
      .invoke('text')
      .then((txt) => {
        const facetTypeDetected = analyticsBody.facetState[0].facetType;
        txt = convertFacetValueToAPIformat(txt.trim(), facetTypeDetected);
        expect(analyticsBody.customData).to.have.property('facetValue', txt);
      });
  });

  cy.get(FacetAlias.facetFirstValue)
    .find(FacetSelectors.checkbox)
    .should('be.checked');
  assertNonZeroFacetCount();
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
      const formtedStart = revertFormatedNumericFacet(start);
      const formatedEnd = revertFormatedNumericFacet(end);
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
  const formatedStartValue = new Intl.NumberFormat().format(
    Number(range.start)
  );
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
  cy.wait('@coveoAnalytics');

  cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();
  cy.wait('@coveoAnalytics');

  cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();
  cy.get(FacetAlias.facetFirstValue)
    .find(FacetSelectors.checkbox)
    .should('not.be.checked');
  cy.wait('@coveoAnalytics').then(({request}) => {
    expect(request.body).to.have.property('actionCause', 'facetDeselect');
    expect(request.body.customData).to.have.property('facetField', field);
  });
}

export function assertClearAllFacet() {
  cy.wait('@coveoAnalytics');

  cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();
  cy.wait('@coveoAnalytics');

  cy.get(FacetAlias.facetSecondValue).find(FacetSelectors.label).click();
  cy.wait('@coveoAnalytics');

  cy.get(FacetAlias.facetShadow).find(FacetSelectors.clearAllButton).click();
  cy.wait('@coveoAnalytics').then(({request}) => {
    expect(request.body).to.have.property('actionCause', 'facetClearAll');
    expect(request.body.facetState).to.have.lengthOf(0);
  });

  cy.get(FacetAlias.facetFirstValue)
    .find(FacetSelectors.checkbox)
    .should('not.be.checked');
  cy.get(FacetAlias.facetSecondValue)
    .find(FacetSelectors.checkbox)
    .should('not.be.checked');
}

export function assertNonZeroFacetCount(selector?: string) {
  selector = selector ? selector : FacetAlias.facetAllValueCount;
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

export function revertFormatedNumericFacet(num: string) {
  return Number(num.replace(/,/g, ''));
}

export function revertFormatedDateFacet(date: string) {
  const splitDate = date.split('/');
  const year = splitDate[2];
  const month = splitDate[1];
  const day = splitDate[0];
  return `${year}/${month}/${day}`;
}

export function assertClickShowMore(
  totalFacetValueBefore: number,
  totalFacetValueAfter = totalFacetValueBefore * 2
) {
  validateFacetNumberofValueEqual(totalFacetValueBefore);
  cy.get(FacetAlias.facetShadow).find(FacetSelectors.showMoreButton).click();
  validateFacetNumberofValueEqual(totalFacetValueAfter);
  cy.get(FacetAlias.facetShadow)
    .find(FacetSelectors.showLessButton)
    .should('be.visible');
}

export function assertShowMoreUA(field: string) {
  cy.get(FacetAlias.facetShadow).find(FacetSelectors.showMoreButton).click();
  cy.wait('@coveoAnalytics').then((intercept: any) => {
    const analyticsBody = intercept.request.body;
    expect(analyticsBody).to.have.property('eventType', 'facet');
    expect(analyticsBody).to.have.property(
      'eventValue',
      'showMoreFacetResults'
    );
    expect(analyticsBody.customData).to.have.property('facetField', field);
  });
}

export function assertClickShowLess(
  totalFacetValueBefore: number,
  totalFacetValueAfter = totalFacetValueBefore / 2
) {
  cy.get(FacetAlias.facetShadow).find(FacetSelectors.showMoreButton).click();
  validateFacetNumberofValueEqual(totalFacetValueBefore);
  cy.get(FacetAlias.facetShadow).find(FacetSelectors.showLessButton).click();
  validateFacetNumberofValueEqual(totalFacetValueAfter);
  cy.get(FacetAlias.facetShadow)
    .find(FacetSelectors.showLessButton)
    .should('not.exist');
}

export function assertShowLessUA(field: string) {
  cy.get(FacetAlias.facetShadow).find(FacetSelectors.showMoreButton).click();
  cy.wait('@coveoAnalytics');
  cy.get(FacetAlias.facetShadow).find(FacetSelectors.showLessButton).click();
  cy.wait('@coveoAnalytics').then((intercept: any) => {
    const analyticsBody = intercept.request.body;
    expect(analyticsBody).to.have.property('eventType', 'facet');
    expect(analyticsBody).to.have.property(
      'eventValue',
      'showLessFacetResults'
    );
    expect(analyticsBody.customData).to.have.property('facetField', field);
  });
}

export function typeQueryAndWaitUA(searchboxSelector: string, query: string) {
  for (let i = 0; i < query.length; i++) {
    const charac = query.charAt(i);
    cy.get(searchboxSelector).type(charac, {force: true});
    cy.wait('@coveoAnalytics');
  }
}

export function assertHightlightedText(text: string) {
  cy.get(FacetAlias.facetShadow)
    .find('ul[part="search-results"] li[part="search-result"] b')
    .as('textHightlight');
  cy.getTextOfAllElements('@textHightlight').then((labels) => {
    labels.forEach((i: string) => {
      expect(i.toLowerCase()).not.to.contains(text.toLowerCase());
    });
  });
}
