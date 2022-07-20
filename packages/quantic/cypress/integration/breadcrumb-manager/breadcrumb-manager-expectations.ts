import {InterceptAliases} from '../../page-objects/search';
import {should} from '../common-selectors';
import {
  BreadcrumbManagerSelector,
  BreadcrumbManagerSelectors,
  BreadcrumbSelector,
} from './breadcrumb-manager-selectors';

function baseBreadcrumbManagerExpectations(
  selector: BreadcrumbSelector,
  name: string
) {
  return {
    displayBreadcrumb: (display: boolean) => {
      selector
        .get()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the ${name} breadcrumb`);
    },
    displayLabel: (display: boolean) => {
      selector
        .label()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(display)} display the label of ${name} breadcrumb`
        );
    },
    labelContains: (label: string) => {
      selector
        .label()
        .contains(label)
        .logDetail(`should have the label "${label}"`);
    },
    displayValues: (display: boolean) => {
      selector
        .values()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(display)} display the values of ${name} breadcrumb`
        );
    },
    numberOfValues: (value: number) => {
      selector
        .values()
        .should('have.length', value)
        .logDetail(`should display ${value} ${name} breadcrumb values`);
    },
    firstBreadcrumbValueLabelContains: (value: string) => {
      selector
        .firstBreadcrumbValueLabel()
        .contains(value)
        .logDetail(`should have the value "${value}" at first value`);
    },
    firstBreadcrumbAltTextContains: (value: string) => {
      selector
        .firstBreadcrumbAltText()
        .contains(value)
        .logDetail(
          `should have the "${value}" as slds-assistive-text at first value`
        );
    },
    displayShowMore: (display: boolean) => {
      selector
        .showMoreButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(display)} display the show more button ${name} breadcrumb`
        );
    },
  };
}

function breadcrumbManagerExpectations(selector: BreadcrumbManagerSelector) {
  return {
    displayBreadcrumbManager: (display: boolean) => {
      selector
        .get()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the breadcrumb manager`);
    },
    displayClearFilters: (display: boolean) => {
      selector
        .clearFilters()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the breadcrumb manager`);
    },
    logFacetBreadcrumbFacet: (field: string) => {
      cy.wait(InterceptAliases.UA.Breadcrumb)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property(
            'actionCause',
            'breadcrumbFacet'
          );
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
        })
        .logDetail('should log the "breadcrumbFacet" UA event');
    },
    logCategoryFacetBreadcrumbFacet: (field: string) => {
      cy.wait(InterceptAliases.UA.Breadcrumb)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property(
            'actionCause',
            'breadcrumbFacet'
          );
          expect(analyticsBody.customData).to.have.property(
            'categoryFacetField',
            field
          );
        })
        .logDetail('should log the category "breadcrumbFacet" UA event');
    },
  };
}

export const BreadcrumbManagerExpectations = {
  ...breadcrumbManagerExpectations(BreadcrumbManagerSelectors),
  facetBreadcrumb: {
    ...baseBreadcrumbManagerExpectations(
      BreadcrumbManagerSelectors.facet(),
      'facet'
    ),
  },
  numericFacetBreadcrumb: {
    ...baseBreadcrumbManagerExpectations(
      BreadcrumbManagerSelectors.numericFacet(),
      'numeric facet'
    ),
  },
  categoryFacetBreadcrumb: {
    ...baseBreadcrumbManagerExpectations(
      BreadcrumbManagerSelectors.categoryFacet(),
      'category facet'
    ),
  },
  dateFacetBreadcrumb: {
    ...baseBreadcrumbManagerExpectations(
      BreadcrumbManagerSelectors.dateFacet(),
      'date facet'
    ),
  },
};
