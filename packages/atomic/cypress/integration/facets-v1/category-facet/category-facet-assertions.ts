import {
  doSortAlphanumeric,
  doSortOccurences,
} from '../../../utils/componentUtils';
import {RouteAlias} from '../../../utils/setupComponent';
import {ResultListSelectors} from '../../result-list-selectors';
import {
  CategoryFacetSelectors,
  BreadcrumbSelectors,
} from './category-facet-selectors';
import {hierarchicalField} from './category-facet-actions';
import {should} from '../../common-assertions';

export function assertNumberOfChildValues(value: number) {
  it(`should display ${value} number of idle link values`, () => {
    if (value > 0) {
      CategoryFacetSelectors.childValue().its('length').should('eq', value);
      return;
    }

    CategoryFacetSelectors.childValue().should('not.exist');
  });
}

export function assertNumberOfParentValues(value: number) {
  it(`should display ${value} number of parent values`, () => {
    CategoryFacetSelectors.activeParentValue().should(
      value > 0 ? 'be.visible' : 'not.exist'
    );

    if (value <= 1) {
      CategoryFacetSelectors.parentValue().should('not.exist');
      return;
    }

    CategoryFacetSelectors.parentValue()
      .its('length')
      .should('eq', value - 1);
  });
}

export function assertPathInBreadcrumb(path: string[]) {
  const ellipsedPath =
    path.length > 3 ? path.slice(0, 1).concat(['...'], path.slice(-2)) : path;
  const joinedPath = ellipsedPath.join(' / ');
  it(`should display the selected path "${joinedPath}" in the breadcrumbs`, () => {
    BreadcrumbSelectors.breadcrumbButton().first().contains(joinedPath);
  });
}

export function assertPathInUrl(path: string[]) {
  const categoryFacetListInUrl = path.join(',');
  it(`should display the selected path "${categoryFacetListInUrl}" in the url`, () => {
    const urlHash = `#cf[${hierarchicalField}]=${encodeURI(
      categoryFacetListInUrl
    )}`;
    cy.url().should('include', urlHash);
  });
}

export function assertNoBreadcrumb() {
  it('should not have any breadcrumb', () => {
    BreadcrumbSelectors.breadcrumbButton().should('not.exist');
  });
}

export function assertNoPathInUrl() {
  it('should not display a selected path in the url', () => {
    cy.url().should('not.include', '#cf');
  });
}

export function assertLogFacetSelect(path: string[]) {
  it('should log the facet selection to UA', () => {
    cy.wait(RouteAlias.analytics).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
      expect(analyticsBody.customData).to.have.property(
        'facetValue',
        path.join(';')
      );
      expect(analyticsBody.customData).to.have.property(
        'facetField',
        hierarchicalField
      );

      expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
      expect(analyticsBody.facetState[0]).to.have.property(
        'field',
        hierarchicalField
      );
      expect(analyticsBody.facetState[0]).to.have.property(
        'facetType',
        'hierarchical'
      );
    });
  });
}

export function assertLogFacetShowMore() {
  it('should log the facet show more results to UA', () => {
    cy.wait(RouteAlias.analytics).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('eventType', 'facet');
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showMoreFacetResults'
      );
      expect(analyticsBody.customData).to.have.property(
        'facetField',
        hierarchicalField
      );
    });
  });
}

export function assertLogClearFacetValues() {
  it('should log the facet clear all to UA', () => {
    cy.wait(RouteAlias.analytics).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetClearAll');
      expect(analyticsBody.customData).to.have.property(
        'facetField',
        hierarchicalField
      );
    });
  });
}

export function assertLogFacetShowLess() {
  it('should log the facet show less results to UA', () => {
    cy.wait(RouteAlias.analytics).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('eventType', 'facet');
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showLessFacetResults'
      );
      expect(analyticsBody.customData).to.have.property(
        'facetField',
        hierarchicalField
      );
    });
  });
}

export function assertValuesSortedByOccurences() {
  it('values should be ordered by occurences', () => {
    CategoryFacetSelectors.valueCount().as('categoryFacetAllValuesCount');
    cy.getTextOfAllElements('@categoryFacetAllValuesCount').then(
      (originalValues) => {
        expect(originalValues).to.eql(doSortOccurences(originalValues));
      }
    );
  });
}

export function assertValuesSortedAlphanumerically() {
  it('values should be ordered alphanumerically', () => {
    CategoryFacetSelectors.valueLabel().as('categoryFacetAllValuesLabel');
    cy.getTextOfAllElements('@categoryFacetAllValuesLabel').then(
      (originalValues) => {
        expect(originalValues).to.eql(doSortAlphanumeric(originalValues));
      }
    );
  });
}

export function assertFirstChildContains(value: string) {
  it(`first child value should contain ${value}`, () => {
    CategoryFacetSelectors.childValue().first().contains(value);
  });
}

export function assertNumberOfSearchResults(numberOfResults: number) {
  it(`should have ${numberOfResults} search results`, () => {
    cy.get(ResultListSelectors.component)
      .find(ResultListSelectors.result)
      .should('have.length', numberOfResults);
  });
}

export function assertDisplaySearchInput(display: boolean) {
  it(`${should(display)} display a the facet search input`, () => {
    CategoryFacetSelectors.searchInput().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertNumberOfFacetSearchResults(value: number) {
  it(`should display ${value} number of facet search results`, () => {
    if (value > 0) {
      CategoryFacetSelectors.searchResult().its('length').should('eq', value);
      return;
    }

    CategoryFacetSelectors.searchResult().should('not.exist');
  });
}
