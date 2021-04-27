import {
  doSortAlphanumeric,
  doSortOccurences,
} from '../../../utils/componentUtils';
import {RouteAlias} from '../../../utils/setupComponent';
import {ComponentErrorSelectors} from '../../component-error-selectors';
import {ResultListSelectors} from '../../result-list-selectors';
import {
  CategoryFacetSelectors,
  categoryFacetComponent,
  BreadcrumbSelectors,
} from './category-facet-selectors';
import {hierarchicalField} from './category-facet-actions';

function should(should: boolean) {
  return should ? 'should' : 'should not';
}

export function assertAccessibility() {
  it('should pass accessibility tests', () => {
    cy.checkA11y(categoryFacetComponent);
  });
}

export function assertNumberOfChildValues(value: number) {
  it('should display the right number of child values', () => {
    if (value > 0) {
      CategoryFacetSelectors.childValue().its('length').should('eq', value);
      return;
    }

    CategoryFacetSelectors.childValue().should('not.exist');
  });
}

export function assertNumberOfParentValues(value: number) {
  it('should display the right number of parent values', () => {
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

export function assertLabelContains(label: string) {
  it('should have the correct label', () => {
    CategoryFacetSelectors.label().contains(label);
  });
}

export function assertDisplayShowMoreButton(display: boolean) {
  it(`${should(display)} display a "Show more" button`, () => {
    CategoryFacetSelectors.showMoreButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayShowLessButton(display: boolean) {
  it(`${should(display)} display a "Show less" button`, () => {
    CategoryFacetSelectors.showLessButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayClearButton(display: boolean) {
  it(`${should(display)} display a "All Categories" button`, () => {
    CategoryFacetSelectors.clearButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertContainsComponentError(display: boolean) {
  it(`${should(display)} display an error component`, () => {
    CategoryFacetSelectors.shadow()
      .find(ComponentErrorSelectors.component)
      .should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertDisplayFacet(display: boolean) {
  it(`${should(display)} display the facet`, () => {
    CategoryFacetSelectors.wrapper().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayPlaceholder(display: boolean) {
  it(`${should(display)} display the placeholder`, () => {
    CategoryFacetSelectors.placeholder().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertPathInBreadcrumb(path: string[]) {
  const ellipsedPath =
    path.length > 3 ? path.slice(0, 1).concat(['...'], path.slice(-2)) : path;
  it('should display the selected path in the breadcrumbs', () => {
    BreadcrumbSelectors.breadcrumbButton()
      .first()
      .contains(ellipsedPath.join(' / '));
  });
}

export function assertPathInUrl(path: string[]) {
  it('should display the selected path in the url', () => {
    const categoryFacetListInUrl = path.join(',');
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
  it('first child value should contain the proper value', () => {
    CategoryFacetSelectors.childValue().first().contains(value);
  });
}

export function assertNumberOfSearchResults(numberOfResults: number) {
  it('should have the correct number of search results', () => {
    cy.get(ResultListSelectors.component)
      .find(ResultListSelectors.result)
      .should('have.length', numberOfResults);
  });
}
