import {TestFixture} from '../../../fixtures/test-fixture';
import {
  doSortAlphanumeric,
  doSortOccurences,
} from '../../../utils/componentUtils';
import {FacetSelectors} from './facet-selectors';

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
