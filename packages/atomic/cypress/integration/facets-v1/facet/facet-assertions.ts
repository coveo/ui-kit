import {TestFixture} from '../../../fixtures/test-fixture';
import {
  doSortAlphanumeric,
  doSortOccurences,
} from '../../../utils/componentUtils';
import {ComponentErrorSelectors} from '../../component-error-selectors';
import {facetComponent, FacetSelectors} from './facet-selectors';

function should(should: boolean) {
  return should ? 'should' : 'should not';
}

export function assertAccessibility() {
  it('should pass accessibility tests', () => {
    cy.checkA11y(facetComponent);
  });
}

export function assertContainsComponentError(display: boolean) {
  it(`${should(display)} display an error component`, () => {
    FacetSelectors.shadow()
      .find(ComponentErrorSelectors.component)
      .should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertDisplayFacet(display: boolean) {
  it(`${should(display)} display the facet`, () => {
    FacetSelectors.wrapper().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertDisplayPlaceholder(display: boolean) {
  it(`${should(display)} display the placeholder`, () => {
    FacetSelectors.placeholder().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertNumberOfSelectedCheckboxValues(value: number) {
  it(`should display ${value} number of selected checkbox values`, () => {
    if (value > 0) {
      FacetSelectors.selectedCheckboxValue().its('length').should('eq', value);
      return;
    }

    FacetSelectors.selectedCheckboxValue().should('not.exist');
  });
}

export function assertNumberOfIdleCheckboxValues(value: number) {
  it(`should display ${value} number of idle checkbox values`, () => {
    if (value > 0) {
      FacetSelectors.idleCheckboxValue().its('length').should('eq', value);
      return;
    }

    FacetSelectors.idleCheckboxValue().should('not.exist');
  });
}

export function assertNumberOfSelectedLinkValues(value: number) {
  it(`should display ${value} number of selected link values`, () => {
    if (value > 0) {
      FacetSelectors.selectedLinkValue().its('length').should('eq', value);
      return;
    }

    FacetSelectors.selectedLinkValue().should('not.exist');
  });
}

export function assertNumberOfIdleLinkValues(value: number) {
  it(`should display ${value} number of idle link values`, () => {
    if (value > 0) {
      FacetSelectors.idleLinkValue().its('length').should('eq', value);
      return;
    }

    FacetSelectors.idleLinkValue().should('not.exist');
  });
}

export function assertNumberOfSelectedBoxValues(value: number) {
  it(`should display ${value} number of selected box values`, () => {
    if (value > 0) {
      FacetSelectors.selectedBoxValue().its('length').should('eq', value);
      return;
    }

    FacetSelectors.selectedBoxValue().should('not.exist');
  });
}

export function assertNumberOfIdleBoxValues(value: number) {
  it(`should display ${value} number of idle box values`, () => {
    if (value > 0) {
      FacetSelectors.idleBoxValue().its('length').should('eq', value);
      return;
    }

    FacetSelectors.idleBoxValue().should('not.exist');
  });
}

export function assertDisplayValues(display: boolean) {
  it(`${should(display)} display facet values`, () => {
    FacetSelectors.values().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertDisplayShowMoreButton(display: boolean) {
  it(`${should(display)} display a "Show more" button`, () => {
    FacetSelectors.showMoreButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayShowLessButton(display: boolean) {
  it(`${should(display)} display a "Show less" button`, () => {
    FacetSelectors.showLessButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayClearButton(display: boolean) {
  it(`${should(display)} display a "Clear filter" button`, () => {
    FacetSelectors.clearButton().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertLabelContains(label: string) {
  it(`should have the label ${label}`, () => {
    FacetSelectors.labelButton().contains(label);
  });
}

export function assertDisplaySearchInput(display: boolean) {
  it(`${should(display)} display a the facet search input`, () => {
    FacetSelectors.searchInput().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertLogFacetSelect(field: string, index: number) {
  it('should log the facet select results to UA ', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
      expect(analyticsBody.customData).to.have.property('facetField', field);
      expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
      expect(analyticsBody.facetState[0]).to.have.property('field', field);

      FacetSelectors.facetValueLabelAtIndex(index)
        .invoke('text')
        .then((txt: string) => {
          expect(analyticsBody.customData).to.have.property('facetValue', txt);
        });
    });
  });
}

export function assertLogClearFacetValues(field: string) {
  it('should log the facet clear all to UA', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetClearAll');
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}

export function assertValuesSortedAlphanumerically() {
  it('values should be ordered alphanumerically', () => {
    FacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      expect(originalValues).to.eql(doSortAlphanumeric(originalValues));
    });
  });
}

export function assertValuesSortedByOccurences() {
  it('values should be ordered by occurences', () => {
    FacetSelectors.valueCount().as('facetAllValuesCount');
    cy.getTextOfAllElements('@facetAllValuesCount').then((originalValues) => {
      expect(originalValues).to.eql(doSortOccurences(originalValues));
    });
  });
}

export function assertLogFacetShowMore(field: string) {
  it('should log the facet show more results to UA', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('eventType', 'facet');
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showMoreFacetResults'
      );
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}

export function assertLogFacetShowLess(field: string) {
  it('should log the facet show less results to UA', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('eventType', 'facet');
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showLessFacetResults'
      );
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}

export function assertFirstValueContains(value: string) {
  it(`first child value should contain ${value}`, () => {
    FacetSelectors.valueLabel().first().contains(value);
  });
}
